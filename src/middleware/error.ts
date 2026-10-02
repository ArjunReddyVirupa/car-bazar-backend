import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { AppError } from '../utils/http.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request data.', details: error.flatten() }
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: error.message }
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const status = error.code === 'P2002' ? 409 : 400;
    res.status(status).json({
      success: false,
      error: { code: error.code, message: error.code === 'P2002' ? 'A record with this value already exists.' : 'Database request failed.' }
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) }
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' }
  });
};
