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
import { canProcessImages, GUEST_FREE_IMAGE_LIMIT, getPlanAccess } from "@/lib/plans";
import { sanitizeFilename } from "@/lib/files";

export const runtime = "nodejs";
export const maxDuration = 60;

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 15);
const maxBatchUploadMb = Number(process.env.MAX_BATCH_UPLOAD_MB || 60);
const maxBatchSize = 20;

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
  const form = await request.formData();
  const files = form.getAll("files");

  if (!files.length) {
    return NextResponse.json({ error: "Upload at least one image." }, { status: 400 });
  }

  if (files.length > maxBatchSize) {
    return NextResponse.json({ error: `Upload ${maxBatchSize} images or fewer at a time.` }, { status: 400 });
  }

  const parsedFiles: File[] = [];
  for (const item of files) {
    const parsed = z.instanceof(File).safeParse(item);
    if (!parsed.success) continue;
    const file = parsed.data;

    if (!isAllowedImageType(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and WEBP images are supported." }, { status: 400 });
    }

    if (file.size > maxUploadMb * 1024 * 1024) {
      return NextResponse.json({ error: `Each image must be ${maxUploadMb}MB or smaller.` }, { status: 400 });
    }

    parsedFiles.push(file);
  }

  if (!parsedFiles.length) {
    return NextResponse.json({ error: "No valid images were found." }, { status: 400 });
  }

  const totalUploadBytes = parsedFiles.reduce((total, file) => total + file.size, 0);
  if (totalUploadBytes > maxBatchUploadMb * 1024 * 1024) {
    return NextResponse.json(
      { error: `Upload ${maxBatchUploadMb}MB or less at a time. Try fewer images in this batch.` },
      { status: 413 }
    );
  }

  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;

  if (user && !canProcessImages(profile, parsedFiles.length)) {
    return NextResponse.json(
      {
        error: "You have used your 10 free cleans. Choose a paid plan to keep cleaning images.",
        usage: getPlanAccess(profile)
      },
      { status: 402 }
    );
  }

  const supabase = createAdminClient();
  const expiresAt = new Date(Date.now() + Number(process.env.DELETE_AFTER_HOURS || 24) * 60 * 60 * 1000);

  const settled = await settleWithConcurrency(parsedFiles, 2, async (file) => {
      try {
        return await processImage(file, user?.id || null, expiresAt);
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

  async function processImage(file: File, userId: string | null, expiresAtValue: Date) {
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const metadataBeforeRaw = await readSharpMetadata(originalBuffer);
    const metadataBefore = extractSimpleMetadata(metadataBeforeRaw, originalBuffer);
    const cleanedBuffer = await cleanImageBuffer(originalBuffer, file.type);
    const metadataAfterRaw = await readSharpMetadata(cleanedBuffer);
    const metadataAfter = extractSimpleMetadata(metadataAfterRaw, cleanedBuffer);
    const extension = extensionForType(file.type);
    const cleanedName = `${sanitizeFilename(file.name)}-cleaned.${extension}`;
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
      downloadUrl: `/api/images/download/${id}`
    };
  }
}

async function settleWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
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
          value: await worker(items[currentIndex])
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
