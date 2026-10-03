import { supabaseAdmin } from "../config/supabase.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export async function uploadImage(path: string, data: Buffer) {
  const { error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(path, data, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new AppError(
      502,
      `Image storage upload failed: ${error.message}`,
      "STORAGE_UPLOAD_FAILED"
    );
  }

  const { data: publicData } = supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(path);

  return {
    path,
    publicUrl: publicData.publicUrl,
  };
}

/**
 * Creates a signed upload target.
 *
 * The browser can use this target to upload directly
 * to Supabase Storage without sending the image through Vercel.
 */
export async function createSignedImageUpload(path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new AppError(
      502,
      `Unable to create signed image upload: ${
        error?.message ?? "Unknown error"
      }`,
      "SIGNED_UPLOAD_FAILED"
    );
  }

  const { data: publicData } = supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(path);

  return {
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: publicData.publicUrl,
  };
}

export function getPublicImageUrl(path: string) {
  const { data } = supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteImage(path: string) {
  const { error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    throw new AppError(
      502,
      `Image storage delete failed: ${error.message}`,
      "STORAGE_DELETE_FAILED"
    );
  }
}

export function safePublicStoragePath(path: string) {
  return encodePath(path);
}
