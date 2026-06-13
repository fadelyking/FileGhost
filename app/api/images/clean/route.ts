import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, getProfile, incrementUsage } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  cleanImageBuffer,
  extensionForType,
  extractSimpleMetadata,
  isAllowedImageType,
  readSharpMetadata
} from "@/lib/metadata";
import { GUEST_FREE_IMAGE_LIMIT, getPlanAccess } from "@/lib/plans";
import { sanitizeFilename } from "@/lib/files";
import { MAX_BATCH_FILES, MAX_BATCH_SIZE_BYTES, MAX_BATCH_SIZE_MB, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    return await handleCleanRequest(request);
  } catch (error) {
    console.error("Image cleaning request failed", { error });
    return NextResponse.json(
      {
        error: "We couldn't process this upload. Try again or upload fewer images at once."
      },
      { status: 500 }
    );
  }
}

async function handleCleanRequest(request: Request) {
  const requestBytes = contentLengthBytes(request);
  if (requestBytes && requestBytes > MAX_BATCH_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: "BATCH_SIZE_EXCEEDED",
        message: `Total upload size (${formatSizeMb(requestBytes)}MB) exceeds the ${MAX_BATCH_SIZE_MB}MB limit.`
      },
      { status: 413 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.error("Upload form parsing failed", {
      contentLength: requestBytes,
      error
    });
    return NextResponse.json(
      {
        error: "UPLOAD_PARSE_FAILED",
        message: "This upload was too large or could not be read. Try fewer images at once."
      },
      { status: 413 }
    );
  }
  const files = form.getAll("files");
  const renameFiles = form.get("renameFiles") === "true";
  const renameStartIndex = parseRenameStartIndex(form.get("renameStartIndex"));

  if (!files.length) {
    return NextResponse.json({ error: "Upload at least one image." }, { status: 400 });
  }

  if (files.length > MAX_BATCH_FILES) {
    return NextResponse.json(
      {
        error: "TOO_MANY_FILES",
        message: `${files.length} images selected, maximum is ${MAX_BATCH_FILES}.`
      },
      { status: 413 }
    );
  }

  const parsedFiles: File[] = [];
  for (const item of files) {
    const parsed = z.instanceof(File).safeParse(item);
    if (!parsed.success) continue;
    const file = parsed.data;

    if (!isAllowedImageType(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and WEBP images are supported." }, { status: 400 });
    }

    parsedFiles.push(file);
  }

  if (!parsedFiles.length) {
    return NextResponse.json({ error: "No valid images were found." }, { status: 400 });
  }

  const oversizedFiles = parsedFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
  if (oversizedFiles.length > 0) {
    return NextResponse.json(
      {
        error: "FILE_TOO_LARGE",
        message: `${oversizedFiles.length} file(s) exceed the ${MAX_FILE_SIZE_MB}MB per-image limit.`,
        files: oversizedFiles.map((file) => file.name)
      },
      { status: 413 }
    );
  }

  const totalUploadBytes = parsedFiles.reduce((total, file) => total + file.size, 0);
  if (totalUploadBytes > MAX_BATCH_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: "BATCH_SIZE_EXCEEDED",
        message: `Total upload size (${formatSizeMb(totalUploadBytes)}MB) exceeds the ${MAX_BATCH_SIZE_MB}MB limit.`
      },
      { status: 413 }
    );
  }

  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  let profile: Awaited<ReturnType<typeof getProfile>> | null = null;
  try {
    user = await getCurrentUser();
    profile = user ? await getProfile(user.id) : null;
  } catch (error) {
    console.error("Auth/profile lookup failed during image cleaning", { error });
    return NextResponse.json(
      { error: "We couldn't verify your account for this upload. Refresh and try again." },
      { status: 401 }
    );
  }

  const access = user
    ? getPlanAccess(profile)
    : {
        freeUsed: 0,
        freeLimit: GUEST_FREE_IMAGE_LIMIT,
        plan: "guest",
        remaining: GUEST_FREE_IMAGE_LIMIT,
        paid: false
      };
  const cleansRemaining = access.remaining ?? MAX_BATCH_FILES;

  if (!access.paid && parsedFiles.length > cleansRemaining) {
    return NextResponse.json(
      {
        error: "INSUFFICIENT_CREDITS",
        message: `You have ${cleansRemaining} free clean(s) remaining but selected ${parsedFiles.length} images.`,
        cleansRemaining,
        filesSubmitted: parsedFiles.length,
        usage: access
      },
      { status: 403 }
    );
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("Supabase admin client unavailable during image cleaning", { error });
    return NextResponse.json(
      { error: "Image storage is not configured yet. Check the production secrets and try again." },
      { status: 500 }
    );
  }
  const expiresAt = new Date(Date.now() + Number(process.env.DELETE_AFTER_HOURS || 24) * 60 * 60 * 1000);

  const settled = await settleWithConcurrency(parsedFiles, 2, async (file, index) => {
      try {
        return await processImage(file, user?.id || null, expiresAt, renameFiles, renameStartIndex + index);
      } catch (error) {
        console.error("Image cleaning failed", {
          filename: file.name,
          size: file.size,
          type: file.type,
          error
        });
        throw error;
      }
    });

  const results = settled
    .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof processImage>>> => result.status === "fulfilled")
    .map((result) => result.value);

  const failed = settled.flatMap((result, index) => {
    if (result.status === "fulfilled") return [];
    return [
      {
        filename: parsedFiles[index].name,
        error: readableError(result.reason)
      }
    ];
  });

  if (!results.length) {
    return NextResponse.json(
      {
        error: "We couldn't process these images. This is usually temporary - try again or upload fewer images at once.",
        failed
      },
      { status: 422 }
    );
  }

  let updatedProfile = profile;
  if (user && !getPlanAccess(profile).paid) {
    try {
      await incrementUsage(user.id, results.length);
      updatedProfile = await getProfile(user.id);
    } catch (error) {
      console.error("Usage tracking failed after image cleaning", {
        userId: user.id,
        imageCount: results.length,
        error
      });
    }
  }

  const usage = user
    ? getPlanAccess(updatedProfile)
    : {
        freeUsed: 0,
        freeLimit: GUEST_FREE_IMAGE_LIMIT,
        plan: "guest",
        remaining: GUEST_FREE_IMAGE_LIMIT,
        paid: false
      };

  return NextResponse.json({
    results,
    failed,
    partial: failed.length > 0,
    usage
  });

  async function processImage(file: File, userId: string | null, expiresAtValue: Date, shouldRename: boolean, renameIndex: number) {
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const metadataBeforeRaw = await readSharpMetadata(originalBuffer);
    const metadataBefore = extractSimpleMetadata(metadataBeforeRaw, originalBuffer);
    const cleanedBuffer = await cleanImageBuffer(originalBuffer, file.type);
    const metadataAfterRaw = await readSharpMetadata(cleanedBuffer);
    const metadataAfter = extractSimpleMetadata(metadataAfterRaw, cleanedBuffer);
    const extension = outputExtension(file);
    const cleanedName = shouldRename
      ? `cleaned_image_${renameIndex + 1}.${extension}`
      : `${sanitizeFilename(file.name)}-cleaned.${extension}`;
    const id = crypto.randomUUID();
    const storagePath = `${userId || "guest"}/${id}.${extension}`;

    const upload = await supabase.storage
      .from("cleaned-images")
      .upload(storagePath, cleanedBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (upload.error) {
      throw new Error(upload.error.message);
    }

    const { error: insertError } = await supabase.from("processed_images").insert({
      id,
      user_id: userId,
      original_filename: file.name,
      cleaned_filename: cleanedName,
      storage_path: storagePath,
      mime_type: file.type,
      metadata_before: metadataBefore,
      metadata_after: metadataAfter,
      file_size_before: file.size,
      file_size_after: cleanedBuffer.length,
      expires_at: expiresAtValue.toISOString()
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return {
      id,
      originalName: file.name,
      cleanedName,
      mimeType: file.type,
      sizeBefore: file.size,
      sizeAfter: cleanedBuffer.length,
      metadataBefore,
      metadataAfter,
      renamed: shouldRename,
      downloadUrl: `/api/images/download/${id}`
    };
  }
}

async function settleWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      try {
        results[currentIndex] = {
          status: "fulfilled",
          value: await worker(items[currentIndex], currentIndex)
        };
      } catch (reason) {
        results[currentIndex] = {
          status: "rejected",
          reason
        };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker));
  return results;
}

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Could not process this image.";
}

function contentLengthBytes(request: Request) {
  const value = request.headers.get("content-length");
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatSizeMb(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1);
}

function parseRenameStartIndex(value: FormDataEntryValue | null) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function outputExtension(file: File) {
  const match = file.name.toLowerCase().match(/\.([a-z0-9]+)$/);
  const extension = match?.[1];
  if (extension && ["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return extension;
  }

  return extensionForType(file.type);
}
