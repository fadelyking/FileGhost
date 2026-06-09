import { NextResponse } from "next/server";
import archiver from "archiver";
import { PassThrough, Readable } from "stream";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const bodySchema = z.object({
  imageIds: z.array(z.string().uuid()).min(1).max(20)
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Choose at least one cleaned image." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const user = await getCurrentUser();
  const { data: images, error } = await supabase
    .from("processed_images")
    .select("id,user_id,cleaned_filename,storage_path,expires_at")
    .in("id", parsed.data.imageIds);

  if (error || !images?.length) {
    return NextResponse.json({ error: "No cleaned images found." }, { status: 404 });
  }

  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = new PassThrough();
  archive.pipe(stream);

  let added = 0;
  for (const image of images) {
    if (!image.storage_path || new Date(image.expires_at) < new Date()) continue;
    if (image.user_id && image.user_id !== user?.id) continue;

    const { data } = await supabase.storage.from("cleaned-images").download(image.storage_path);
    if (!data) continue;
    archive.append(Buffer.from(await data.arrayBuffer()), { name: image.cleaned_filename });
    added += 1;
  }

  if (!added) {
    return NextResponse.json({ error: "No downloadable images were available." }, { status: 404 });
  }

  void archive.finalize();

  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="FileGhost-cleaned-images.zip"'
    }
  });
}
