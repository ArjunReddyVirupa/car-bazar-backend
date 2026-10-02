import { supabaseAdmin } from "../config/supabase.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export async function testStorage() {
  const { data, error } = await supabaseAdmin.storage.listBuckets();

  console.log("SUPABASE URL:", env.SUPABASE_URL);
  console.log("BUCKET:", env.SUPABASE_STORAGE_BUCKET);
  console.log("BUCKETS:", data);
  console.log("ERROR:", error);
}
await testStorage();
export async function uploadImage(path: string, data: Buffer) {
  const { error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(path, data, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (error)
    throw new AppError(
      502,
      `Image storage upload failed: ${error.message}`,
      "STORAGE_UPLOAD_FAILED"
    );

  const { data: publicData } = supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(path);

  return { path, publicUrl: publicData.publicUrl };
}

export async function deleteImage(path: string) {
  const { error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .remove([path]);
  if (error)
    throw new AppError(
      502,
      `Image storage delete failed: ${error.message}`,
      "STORAGE_DELETE_FAILED"
    );
}

export function safePublicStoragePath(path: string) {
  return encodePath(path);
}
