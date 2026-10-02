-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RC', 'INSURANCE', 'PUC', 'SERVICE_HISTORY', 'OTHER');

-- CreateTable
CREATE TABLE "CarDocument" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "documentNumber" TEXT,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarDocument_carId_idx" ON "CarDocument"("carId");

-- AddForeignKey
ALTER TABLE "CarDocument" ADD CONSTRAINT "CarDocument_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
