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
import { canProcessImages, FREE_IMAGE_LIMIT, getPlanAccess } from "@/lib/plans";
import { sanitizeFilename } from "@/lib/files";

export const runtime = "nodejs";

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 15);
const maxBatchSize = 20;

export async function POST(request: Request) {
  const form = await request.formData();
  const files = form.getAll("files");

  if (!files.length) {
    return NextResponse.json({ error: "Upload at least one image." }, { status: 400 });
  }

  if (files.length > maxBatchSize) {
    return NextResponse.json({ error: `Upload ${maxBatchSize} images or fewer at a time.` }, { status: 400 });
  }

  const parsedFiles = [];
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

  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;

  if (user && !canProcessImages(profile, parsedFiles.length)) {
    return NextResponse.json(
      {
        error: "You have used your 5 free cleans. Choose a paid plan to keep cleaning images.",
        usage: getPlanAccess(profile)
      },
      { status: 402 }
    );
  }

  const supabase = createAdminClient();
  const results = [];
  const expiresAt = new Date(Date.now() + Number(process.env.DELETE_AFTER_HOURS || 24) * 60 * 60 * 1000);

  for (const file of parsedFiles) {
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const metadataBeforeRaw = await readSharpMetadata(originalBuffer);
    const metadataBefore = extractSimpleMetadata(metadataBeforeRaw, originalBuffer);
    const cleanedBuffer = await cleanImageBuffer(originalBuffer, file.type);
    const metadataAfterRaw = await readSharpMetadata(cleanedBuffer);
    const metadataAfter = extractSimpleMetadata(metadataAfterRaw, cleanedBuffer);
    const extension = extensionForType(file.type);
    const cleanedName = `${sanitizeFilename(file.name)}-cleaned.${extension}`;
    const id = crypto.randomUUID();
    const storagePath = `${user?.id || "guest"}/${id}.${extension}`;

    const upload = await supabase.storage
      .from("cleaned-images")
      .upload(storagePath, cleanedBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const { error: insertError } = await supabase.from("processed_images").insert({
      id,
      user_id: user?.id || null,
      original_filename: file.name,
      cleaned_filename: cleanedName,
      storage_path: storagePath,
      mime_type: file.type,
      metadata_before: metadataBefore,
      metadata_after: metadataAfter,
      file_size_before: file.size,
      file_size_after: cleanedBuffer.length,
      expires_at: expiresAt.toISOString()
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    results.push({
      id,
      originalName: file.name,
      cleanedName,
      mimeType: file.type,
      sizeBefore: file.size,
      sizeAfter: cleanedBuffer.length,
      metadataBefore,
      metadataAfter,
      downloadUrl: `/api/images/download/${id}`
    });
  }

  if (user && !getPlanAccess(profile).paid) {
    await incrementUsage(user.id, results.length);
  }

  const updatedProfile = user ? await getProfile(user.id) : null;
  const usage = user
    ? getPlanAccess(updatedProfile)
    : {
        freeUsed: 0,
        freeLimit: FREE_IMAGE_LIMIT,
        plan: "guest",
        remaining: FREE_IMAGE_LIMIT,
        paid: false
      };

  return NextResponse.json({ results, usage });
}
