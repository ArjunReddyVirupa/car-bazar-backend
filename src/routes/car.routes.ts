import { Router } from "express";
import { asyncHandler } from "../utils/http.js";
import { requireAdmin } from "../middleware/auth.js";
import { imageUpload } from "../middleware/upload.js";
import {
  createCar,
  deleteCar,
  deleteCarImage,
  getCar,
  listCars,
  updateCar,
  updateStatus,
  uploadCarImages,
  prepareCarImageUploads,
  completeCarImageUploads,
} from "../controllers/car.controller.js";

export const carRouter = Router();

carRouter.get("/", asyncHandler(listCars));
carRouter.get("/:id", asyncHandler(getCar));

carRouter.post("/", requireAdmin, asyncHandler(createCar));
carRouter.put("/:id", requireAdmin, asyncHandler(updateCar));
carRouter.delete("/:id", requireAdmin, asyncHandler(deleteCar));
carRouter.patch("/:id/status", requireAdmin, asyncHandler(updateStatus));
carRouter.post(
  "/:id/images",
  requireAdmin,
  imageUpload.array("images"),
  asyncHandler(uploadCarImages)
);
carRouter.post(
  "/:id/images/sign",
  requireAdmin,
  asyncHandler(prepareCarImageUploads)
);

carRouter.post(
  "/:id/images/complete",
  requireAdmin,
  asyncHandler(completeCarImageUploads)
);
carRouter.delete(
  "/:id/images/:imageId",
  requireAdmin,
  asyncHandler(deleteCarImage)
);
