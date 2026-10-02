import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/http.js';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_IMAGE_SIZE_MB * 1024 * 1024,
    files: env.MAX_IMAGES_PER_CAR
  },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      cb(new AppError(400, 'Only JPEG, PNG, WebP and AVIF images are allowed.', 'INVALID_IMAGE_TYPE'));
      return;
    }
    cb(null, true);
  }
});
