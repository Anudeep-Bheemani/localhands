import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin, UPLOAD_BUCKET } from "@/lib/supabase";

const ALLOWED_PREFIXES = ["image/", "audio/"];
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "misc").replace(/[^a-z0-9-]/gi, "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_PREFIXES.some((p) => file.type.startsWith(p))) {
    return NextResponse.json({ error: "Only image or audio files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${user.id}/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(UPLOAD_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(UPLOAD_BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
