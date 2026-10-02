import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthUser } from "../types/auth.js";

export function signAccessToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );
}

export function verifyAccessToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (
    typeof payload !== "object" ||
    !payload.sub ||
    !payload.email ||
    !payload.role
  ) {
    throw new Error("Invalid token");
  }
  return {
    id: String(payload.sub),
    email: String(payload.email),
    role: payload.role as AuthUser["role"],
  };
}
