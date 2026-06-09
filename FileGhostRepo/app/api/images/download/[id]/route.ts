import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: image } = await supabase
    .from("processed_images")
    .select("id,user_id,cleaned_filename,storage_path,mime_type,expires_at")
    .eq("id", id)
    .single();

  if (!image || !image.storage_path || new Date(image.expires_at) < new Date()) {
    return NextResponse.json({ error: "Image not found or expired." }, { status: 404 });
  }

  const user = await getCurrentUser();
  if (image.user_id && image.user_id !== user?.id) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const { data, error } = await supabase.storage.from("cleaned-images").download(image.storage_path);
  if (error || !data) {
    return NextResponse.json({ error: "Could not download image." }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      "Content-Type": image.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${image.cleaned_filename}"`
    }
  });
}
