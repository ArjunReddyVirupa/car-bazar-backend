import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/http.js';

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) throw new AppError(401, 'Authentication required.', 'UNAUTHENTICATED');

    const user = verifyAccessToken(token);
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.isActive || dbUser.role !== 'ADMIN') {
      throw new AppError(401, 'Admin account is inactive or invalid.', 'UNAUTHENTICATED');
    }

    req.user = { id: dbUser.id, email: dbUser.email, role: dbUser.role };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, 'Invalid or expired session.', 'UNAUTHENTICATED'));
  }
}
