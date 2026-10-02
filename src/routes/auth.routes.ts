import { Router } from "express";
import { asyncHandler } from "../utils/http.js";
import {
  login,
  logout,
  me,
  refreshToken,
} from "../controllers/auth.controller.js";
import { requireAdmin } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(login));

authRouter.post("/refresh", asyncHandler(refreshToken));

authRouter.post("/logout", asyncHandler(logout));

authRouter.get("/me", requireAdmin, asyncHandler(me));
