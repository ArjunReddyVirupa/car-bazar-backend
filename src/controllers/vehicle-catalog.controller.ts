import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";

export async function getBrands(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const brands = await prisma.vehicleBrand.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    next(error);
  }
}

export async function getModels(
  req: Request<{ brandId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const models = await prisma.vehicleModel.findMany({
      where: {
        brandId: req.params.brandId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    res.json({
      success: true,
      data: models,
    });
  } catch (error) {
    next(error);
  }
}

export async function getVariants(
  req: Request<{ modelId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const variants = await prisma.vehicleVariant.findMany({
      where: {
        modelId: req.params.modelId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    res.json({
      success: true,
      data: variants,
    });
  } catch (error) {
    next(error);
  }
}
