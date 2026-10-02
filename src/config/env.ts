import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_URL: z.string().url().default("http://localhost:4000"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("1d"),
  COOKIE_NAME: z.string().default("car_admin_session"),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().default("car-images"),
  SUPABASE_DOCUMENTS_BUCKET: z.string().default("car-documents"),
  BUSINESS_PHONE: z.string().optional(),
  BUSINESS_WHATSAPP: z.string().optional(),
  MAX_IMAGE_SIZE_MB: z.coerce.number().positive().max(25).default(8),
  MAX_IMAGES_PER_CAR: z.coerce.number().int().positive().max(50).default(20),
});

export const env = envSchema.parse(process.env);
