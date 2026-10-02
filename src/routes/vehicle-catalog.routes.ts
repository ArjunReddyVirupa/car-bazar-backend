import { Router } from "express";
import {
  getBrands,
  getModels,
  getVariants,
} from "../controllers/vehicle-catalog.controller.js";

export const vehicleCatalogRouter = Router();

vehicleCatalogRouter.get("/brands", getBrands);

vehicleCatalogRouter.get("/brands/:brandId/models", getModels);

vehicleCatalogRouter.get("/models/:modelId/variants", getVariants);
