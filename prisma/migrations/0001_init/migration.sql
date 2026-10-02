-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'INACTIVE');
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'LPG');
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC', 'AMT', 'CVT', 'DCT');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Car" (
  "id" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "variant" TEXT,
  "year" INTEGER NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "kmDriven" INTEGER NOT NULL,
  "fuelType" "FuelType" NOT NULL,
  "transmission" "Transmission" NOT NULL,
  "ownerCount" INTEGER NOT NULL DEFAULT 1,
  "location" TEXT NOT NULL,
  "description" TEXT,
  "registrationNumber" TEXT,
  "status" "CarStatus" NOT NULL DEFAULT 'AVAILABLE',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CarImage" (
  "id" TEXT NOT NULL,
  "carId" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "publicUrl" TEXT NOT NULL,
  "originalName" TEXT,
  "mimeType" TEXT NOT NULL DEFAULT 'image/webp',
  "sizeBytes" INTEGER NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CarImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enquiry" (
  "id" TEXT NOT NULL,
  "carId" TEXT,
  "customerName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "Car_status_createdAt_idx" ON "Car"("status", "createdAt");
CREATE INDEX "Car_brand_model_idx" ON "Car"("brand", "model");
CREATE INDEX "Car_price_idx" ON "Car"("price");
CREATE INDEX "Car_year_idx" ON "Car"("year");
CREATE INDEX "Car_fuelType_transmission_idx" ON "Car"("fuelType", "transmission");
CREATE INDEX "Car_location_idx" ON "Car"("location");
CREATE UNIQUE INDEX "CarImage_storagePath_key" ON "CarImage"("storagePath");
CREATE INDEX "CarImage_carId_displayOrder_idx" ON "CarImage"("carId", "displayOrder");
CREATE INDEX "Enquiry_carId_createdAt_idx" ON "Enquiry"("carId", "createdAt");
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

ALTER TABLE "CarImage" ADD CONSTRAINT "CarImage_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;
