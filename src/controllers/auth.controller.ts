import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

function setAccessTokenCookie(res: Response, token: string) {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });
}

function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    path: "/api/auth",
  });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.isActive || user.role !== "ADMIN") {
    throw new AppError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS"
    );
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);

  if (!valid) {
    throw new AppError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS"
    );
  }

  // Short-lived access token
  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Long-lived refresh token
  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "refresh",
    },
    env.JWT_SECRET,
    {
      expiresIn: "90d",
    }
  );

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

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

export async function refreshToken(req: Request, res: Response) {
  const token = req.cookies?.refreshToken as string | undefined;

  if (!token) {
    throw new AppError(
      401,
      "Refresh token is missing.",
      "REFRESH_TOKEN_MISSING"
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      type?: string;
    };

    if (decoded.type !== "refresh") {
      throw new AppError(
        401,
        "Invalid refresh token.",
        "INVALID_REFRESH_TOKEN"
      );
    }

    // Verify that the admin still exists and is active.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive || user.role !== "ADMIN") {
      throw new AppError(
        401,
        "Admin account is inactive or invalid.",
        "UNAUTHENTICATED"
      );
    }

    // Generate a new short-lived access token.
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    setAccessTokenCookie(res, accessToken);

    res.json({
      success: true,
      data: {
        message: "Access token refreshed.",
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      401,
      "Refresh token expired or invalid.",
      "INVALID_REFRESH_TOKEN"
    );
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth",
  });

  res.json({
    success: true,
  });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required.", "UNAUTHENTICATED");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new AppError(401, "Authentication required.", "UNAUTHENTICATED");
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
