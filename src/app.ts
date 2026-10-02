import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { carRouter } from "./routes/car.routes.js";
import { enquiryRouter } from "./routes/enquiry.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error.js";
import { vehicleCatalogRouter } from "./routes/vehicle-catalog.routes.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_LOGIN_ATTEMPTS",
      message: "Too many login attempts. Try again later.",
    },
  },
});

app.use(generalLimiter);
app.get("/api/health", (_req, res) =>
  res.json({
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString() },
  })
);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth", authRouter);
app.use("/api/cars", carRouter);
app.use("/api/enquiries", enquiryRouter);
app.use("/api/admin", adminRouter);
app.use("/api/vehicle-catalog", vehicleCatalogRouter);

app.use((_req, res) =>
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found." },
  })
);
app.use(errorHandler);
