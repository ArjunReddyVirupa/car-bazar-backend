import type { Request, Response } from "express";
import crypto from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";
import {
  createSignedImageUpload,
  deleteImage,
  uploadImage,
} from "../services/storage.service.js";

const fuelValues = [
  "PETROL",
  "DIESEL",
  "CNG",
  "ELECTRIC",
  "HYBRID",
  "LPG",
] as const;
const transmissionValues = [
  "MANUAL",
  "AUTOMATIC",
  "AMT",
  "CVT",
  "DCT",
] as const;
const statusValues = ["AVAILABLE", "RESERVED", "SOLD", "INACTIVE"] as const;

const booleanParam = z.preprocess((value) => {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return value;
}, z.boolean());

const carSchema = z.object({
  // Basic vehicle information
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  variant: z.string().trim().max(100).optional().nullable(),

  year: z.coerce
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),

  price: z.coerce.number().nonnegative().max(9999999999),

  kmDriven: z.coerce.number().int().nonnegative().max(2000000),

  fuelType: z.enum(fuelValues),

  transmission: z.enum(transmissionValues),

  ownerCount: z.coerce.number().int().min(1).max(20).default(1),

  location: z.string().trim().min(1).max(120),

  description: z.string().trim().max(5000).optional().nullable(),

  // Registration
  // registrationNumber: z.string().trim().max(30).optional().nullable(),

  // registrationState: z.string().trim().max(50).optional().nullable(),

  color: z.string().trim().max(50).optional().nullable(),

  ownerType: z.string().trim().max(50).optional().nullable(),

  // RC
  rcAvailable: booleanParam.optional(),
  rcTransferAvailable: booleanParam.optional(),
  originalRcAvailable: booleanParam.optional(),

  rcNotes: z.string().trim().max(2000).optional().nullable(),

  // Insurance
  insuranceAvailable: booleanParam.optional(),

  insuranceType: z.string().trim().max(50).optional().nullable(),

  insuranceValidUntil: z.string().trim().optional().nullable(),

  insuranceCompany: z.string().trim().max(150).optional().nullable(),

  insurancePolicyNumber: z.string().trim().max(100).optional().nullable(),

  // PUC
  pucAvailable: booleanParam.optional(),

  pucValidUntil: z.string().trim().optional().nullable(),

  // Finance
  buyerFinanceAvailable: booleanParam.optional(),
  existingFinance: booleanParam.optional(),

  financeCompany: z.string().trim().max(150).optional().nullable(),

  financeOutstanding: z.coerce
    .number()
    .nonnegative()
    .max(9999999999)
    .optional()
    .nullable(),

  financeClosed: booleanParam.optional(),

  // Service history
  serviceHistoryAvailable: booleanParam.optional(),

  serviceHistoryNotes: z.string().trim().max(3000).optional().nullable(),

  lastServiceDate: z.string().trim().optional().nullable(),

  lastServiceKm: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(2000000)
    .optional()
    .nullable(),

  // Accident / condition
  accidentHistory: booleanParam.optional(),

  accidentHistoryNotes: z.string().trim().max(3000).optional().nullable(),

  conditionNotes: z.string().trim().max(5000).optional().nullable(),

  // Warranty
  warrantyAvailable: booleanParam.optional(),

  warrantyValidUntil: z.string().trim().optional().nullable(),

  warrantyNotes: z.string().trim().max(3000).optional().nullable(),

  // Admin
  status: z.enum(statusValues).optional(),
  featured: booleanParam.optional(),
});

const publicQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(100).optional(),
  brand: z.string().trim().max(80).optional(),
  model: z.string().trim().max(80).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
  maxKmDriven: z.coerce.number().int().nonnegative().optional(),
  fuelType: z.enum(fuelValues).optional(),
  transmission: z.enum(transmissionValues).optional(),
  location: z.string().trim().max(120).optional(),
  status: z.enum(statusValues).default("AVAILABLE"),
  featured: booleanParam.optional(),
});

const idSchema = z.string().cuid();

function serializeCar(car: any) {
  return {
    ...car,
    price: Number(car.price),
    images: car.images?.map((image: any) => ({ ...image })) ?? [],
  };
}

function toDateOrNull(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, "Invalid date.", "INVALID_DATE");
  }

  return date;
}

export async function listCars(req: Request, res: Response) {
  const q = publicQuerySchema.parse(req.query);
  const where: any = { status: q.status };

  if (q.brand) where.brand = { equals: q.brand, mode: "insensitive" };
  if (q.model) where.model = { equals: q.model, mode: "insensitive" };
  if (q.fuelType) where.fuelType = q.fuelType;
  if (q.transmission) where.transmission = q.transmission;
  if (q.location)
    where.location = { contains: q.location, mode: "insensitive" };
  if (q.featured !== undefined) where.featured = q.featured;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) where.price = {};
  if (q.minPrice !== undefined) where.price.gte = q.minPrice;
  if (q.maxPrice !== undefined) where.price.lte = q.maxPrice;
  if (q.minYear !== undefined || q.maxYear !== undefined) where.year = {};
  if (q.minYear !== undefined) where.year.gte = q.minYear;
  if (q.maxYear !== undefined) where.year.lte = q.maxYear;
  if (q.maxKmDriven !== undefined) where.kmDriven = { lte: q.maxKmDriven };
  if (q.search) {
    where.OR = [
      { brand: { contains: q.search, mode: "insensitive" } },
      { model: { contains: q.search, mode: "insensitive" } },
      { variant: { contains: q.search, mode: "insensitive" } },
      { location: { contains: q.search, mode: "insensitive" } },
    ];
  }

  const skip = (q.page - 1) * q.pageSize;
  const [cars, total] = await prisma.$transaction([
    prisma.car.findMany({
      where,
      skip,
      take: q.pageSize,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: { images: { orderBy: { displayOrder: "asc" } } },
    }),
    prisma.car.count({ where }),
  ]);

  res.json({
    success: true,
    data: cars.map(serializeCar),
    meta: {
      page: q.page,
      pageSize: q.pageSize,
      total,
      totalPages: Math.ceil(total / q.pageSize),
    },
  });
}

export async function getCar(req: Request, res: Response) {
  const id = idSchema.parse(req.params.id);
  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: { orderBy: { displayOrder: "asc" } } },
  });
  if (!car) throw new AppError(404, "Car not found.", "CAR_NOT_FOUND");
  res.json({ success: true, data: serializeCar(car) });
}

export async function createCar(req: Request, res: Response) {
  const input = carSchema.parse(req.body);

  const car = await prisma.car.create({
    data: {
      brand: input.brand,
      model: input.model,
      variant: input.variant,

      year: input.year,
      price: input.price,
      kmDriven: input.kmDriven,

      fuelType: input.fuelType,
      transmission: input.transmission,
      ownerCount: input.ownerCount,

      location: input.location,
      description: input.description,

      // Registration
      // registrationNumber: input.registrationNumber,
      // registrationState: input.registrationState,
      color: input.color,
      ownerType: input.ownerType,

      // RC
      rcAvailable: input.rcAvailable ?? false,
      rcTransferAvailable: input.rcTransferAvailable ?? false,
      originalRcAvailable: input.originalRcAvailable ?? false,
      rcNotes: input.rcNotes,

      // Insurance
      insuranceAvailable: input.insuranceAvailable ?? false,
      insuranceType: input.insuranceType,
      insuranceValidUntil: toDateOrNull(input.insuranceValidUntil),
      insuranceCompany: input.insuranceCompany,
      insurancePolicyNumber: input.insurancePolicyNumber,

      // PUC
      pucAvailable: input.pucAvailable ?? false,
      pucValidUntil: toDateOrNull(input.pucValidUntil),

      // Finance
      buyerFinanceAvailable: input.buyerFinanceAvailable ?? false,
      existingFinance: input.existingFinance ?? false,
      financeCompany: input.financeCompany,
      financeOutstanding: input.financeOutstanding ?? null,
      financeClosed: input.financeClosed ?? false,

      // Service history
      serviceHistoryAvailable: input.serviceHistoryAvailable ?? false,
      serviceHistoryNotes: input.serviceHistoryNotes,
      lastServiceDate: toDateOrNull(input.lastServiceDate),
      lastServiceKm: input.lastServiceKm ?? null,

      // Condition
      accidentHistory: input.accidentHistory ?? false,
      accidentHistoryNotes: input.accidentHistoryNotes,
      conditionNotes: input.conditionNotes,

      // Warranty
      warrantyAvailable: input.warrantyAvailable ?? false,
      warrantyValidUntil: toDateOrNull(input.warrantyValidUntil),
      warrantyNotes: input.warrantyNotes,

      // Admin
      status: input.status ?? "AVAILABLE",
      featured: input.featured ?? false,
    },
  });

  res.status(201).json({
    success: true,
    data: serializeCar(car),
  });
}

export async function updateCar(req: Request, res: Response) {
  const id = idSchema.parse(req.params.id);
  const input = carSchema.partial().parse(req.body);

  const existing = await prisma.car.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Car not found.", "CAR_NOT_FOUND");
  }

  const car = await prisma.car.update({
    where: { id },
    data: {
      ...input,

      ...(input.insuranceValidUntil !== undefined && {
        insuranceValidUntil: toDateOrNull(input.insuranceValidUntil),
      }),

      ...(input.pucValidUntil !== undefined && {
        pucValidUntil: toDateOrNull(input.pucValidUntil),
      }),

      ...(input.lastServiceDate !== undefined && {
        lastServiceDate: toDateOrNull(input.lastServiceDate),
      }),

      ...(input.warrantyValidUntil !== undefined && {
        warrantyValidUntil: toDateOrNull(input.warrantyValidUntil),
      }),
    },
  });

  res.json({
    success: true,
    data: serializeCar(car),
  });
}

export async function updateStatus(req: Request, res: Response) {
  const id = idSchema.parse(req.params.id);
  const input = z.object({ status: z.enum(statusValues) }).parse(req.body);
  const car = await prisma.car.update({
    where: { id },
    data: { status: input.status },
  });
  res.json({ success: true, data: serializeCar(car) });
}

export async function deleteCar(req: Request, res: Response) {
  const id = idSchema.parse(req.params.id);
  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!car) throw new AppError(404, "Car not found.", "CAR_NOT_FOUND");

  await prisma.car.delete({ where: { id } });
  await Promise.allSettled(
    car.images.map((image) => deleteImage(image.storagePath))
  );
  res.status(204).send();
}

export async function uploadCarImages(req: Request, res: Response) {
  const id = idSchema.parse(req.params.id);

  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!car) {
    throw new AppError(404, "Car not found.", "CAR_NOT_FOUND");
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  if (files.length === 0) {
    throw new AppError(400, "At least one image is required.", "NO_IMAGES");
  }

  if (car.images.length + files.length > env.MAX_IMAGES_PER_CAR) {
    throw new AppError(
      400,
      `A car can have at most ${env.MAX_IMAGES_PER_CAR} images.`,
      "IMAGE_LIMIT_EXCEEDED"
    );
  }

  const uploaded: {
    path: string;
    publicUrl: string;
  }[] = [];

  const createdImageIds: string[] = [];

  try {
    for (const [index, file] of files.entries()) {
      // Convert every uploaded image to WebP
      const processed = await sharp(file.buffer, {
        limitInputPixels: 25_000_000,
      })
        .rotate()
        .resize({
          width: 2000,
          height: 1500,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: 80,
          effort: 4,
          smartSubsample: true,
        })
        .toBuffer();

      const fileId = crypto.randomUUID();

      const storagePath = `cars/${id}/${fileId}.webp`;

      // Upload optimized WebP to Supabase
      const stored = await uploadImage(storagePath, processed);

      uploaded.push(stored);
      const maxOrder = car.images.reduce(
        (max, image) => Math.max(max, image.displayOrder),
        -1
      );

      // Save image information in database
      const carImage = await prisma.carImage.create({
        data: {
          carId: id,
          storagePath: stored.path,
          publicUrl: stored.publicUrl,
          originalName: file.originalname.slice(0, 255),
          mimeType: "image/webp",
          sizeBytes: processed.length,
          displayOrder: maxOrder + uploaded.length + 1,
        },
      });

      createdImageIds.push(carImage.id);
    }
  } catch (error) {
    // Remove database records created during this upload
    if (createdImageIds.length > 0) {
      await prisma.carImage.deleteMany({
        where: {
          id: {
            in: createdImageIds,
          },
        },
      });
    }

    // Remove files already uploaded to Supabase
    await Promise.allSettled(uploaded.map((file) => deleteImage(file.path)));

    throw error;
  }

  // Return updated car with all images
  const updated = await prisma.car.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: serializeCar(updated),
  });
}

export async function deleteCarImage(req: Request, res: Response) {
  const id = idSchema.parse(req.params.id);
  const imageId = idSchema.parse(req.params.imageId);
  const image = await prisma.carImage.findFirst({
    where: { id: imageId, carId: id },
  });
  if (!image) throw new AppError(404, "Image not found.", "IMAGE_NOT_FOUND");

  await prisma.carImage.delete({ where: { id: image.id } });
  await deleteImage(image.storagePath);
  res.status(204).send();
}

export async function completeCarImageUploads(req: Request, res: Response) {
  const id = idSchema.parse(req.params.id);

  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!car) {
    throw new AppError(404, "Car not found.", "CAR_NOT_FOUND");
  }

  const body = req.body as {
    images?: {
      path?: string;
      publicUrl?: string;
      originalName?: string;
      mimeType?: string;
      sizeBytes?: number;
      displayOrder?: number;
    }[];
  };

  const images = Array.isArray(body.images) ? body.images : [];

  if (images.length === 0) {
    throw new AppError(
      400,
      "At least one uploaded image is required.",
      "NO_IMAGES"
    );
  }

  if (car.images.length + images.length > env.MAX_IMAGES_PER_CAR) {
    throw new AppError(
      400,
      `A car can have at most ${env.MAX_IMAGES_PER_CAR} images.`,
      "IMAGE_LIMIT_EXCEEDED"
    );
  }

  const createdImageIds: string[] = [];

  try {
    for (const image of images) {
      if (
        !image.path ||
        !image.publicUrl ||
        !image.originalName ||
        image.displayOrder == null
      ) {
        throw new AppError(
          400,
          "Invalid uploaded image information.",
          "INVALID_IMAGE_METADATA"
        );
      }

      /*
       * Make sure the path belongs to this car.
       * This prevents an admin request from accidentally
       * attaching an image from another car.
       */
      if (!image.path.startsWith(`cars/${id}/`)) {
        throw new AppError(
          400,
          "Invalid image storage path.",
          "INVALID_IMAGE_PATH"
        );
      }

      const created = await prisma.carImage.create({
        data: {
          carId: id,
          storagePath: image.path,
          publicUrl: image.publicUrl,
          originalName: image.originalName.slice(0, 255),
          mimeType: "image/webp",
          sizeBytes: Number(image.sizeBytes ?? 0),
          displayOrder: Number(image.displayOrder),
        },
      });

      createdImageIds.push(created.id);
    }

    const updatedCar = await prisma.car.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedCar,
    });
  } catch (error) {
    if (createdImageIds.length > 0) {
      await prisma.carImage.deleteMany({
        where: {
          id: {
            in: createdImageIds,
          },
        },
      });
    }

    /*
     * If DB creation fails after Supabase upload,
     * remove the uploaded files as well.
     */
    await Promise.allSettled(
      images
        .map((image) => image.path)
        .filter(
          (path): path is string =>
            typeof path === "string" && path.startsWith(`cars/${id}/`)
        )
        .map((path) => deleteImage(path))
    );

    throw error;
  }
}

export async function prepareCarImageUploads(req: Request, res: Response) {
  const id = idSchema.parse(req.params.id);

  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!car) {
    throw new AppError(404, "Car not found.", "CAR_NOT_FOUND");
  }

  const body = req.body as {
    files?: {
      name?: string;
      size?: number;
      type?: string;
    }[];
  };

  const files = Array.isArray(body.files) ? body.files : [];

  if (files.length === 0) {
    throw new AppError(400, "At least one image is required.", "NO_IMAGES");
  }

  if (car.images.length + files.length > env.MAX_IMAGES_PER_CAR) {
    throw new AppError(
      400,
      `A car can have at most ${env.MAX_IMAGES_PER_CAR} images.`,
      "IMAGE_LIMIT_EXCEEDED"
    );
  }

  const maxOrder = car.images.reduce(
    (max, image) => Math.max(max, image.displayOrder),
    -1
  );

  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const fileId = crypto.randomUUID();

      const storagePath = `cars/${id}/${fileId}.webp`;

      const signed = await createSignedImageUpload(storagePath);

      return {
        path: signed.path,
        token: signed.token,
        signedUrl: signed.signedUrl,
        publicUrl: signed.publicUrl,

        originalName: String(file.name ?? "image.webp").slice(0, 255),

        mimeType: "image/webp",

        sizeBytes: Number(file.size ?? 0),

        displayOrder: maxOrder + index + 1,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      uploads,
    },
  });
}
