import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { signAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/http.js";

const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1).max(200),
});

function setSessionCookie(res: Response, token: string) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !user.isActive || user.role !== "ADMIN") {
    throw new AppError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS"
    );
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid)
    throw new AppError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS"
    );

  const token = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  setSessionCookie(res, token);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("token");

  res.json({
    success: true,
  });
}

export async function me(req: Request, res: Response) {
  if (!req.user)
    throw new AppError(401, "Authentication required.", "UNAUTHENTICATED");
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user)
    throw new AppError(401, "Authentication required.", "UNAUTHENTICATED");
  res.json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
