/*
  Warnings:

  - You are about to drop the `CarDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CarDocument" DROP CONSTRAINT "CarDocument_carId_fkey";

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "accidentHistory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accidentHistoryNotes" TEXT,
ADD COLUMN     "buyerFinanceAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "conditionNotes" TEXT,
ADD COLUMN     "existingFinance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "financeClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "financeCompany" TEXT,
ADD COLUMN     "financeOutstanding" DECIMAL(12,2),
ADD COLUMN     "insuranceAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insuranceCompany" TEXT,
ADD COLUMN     "insurancePolicyNumber" TEXT,
ADD COLUMN     "insuranceType" TEXT,
ADD COLUMN     "insuranceValidUntil" TIMESTAMP(3),
ADD COLUMN     "lastServiceDate" TIMESTAMP(3),
ADD COLUMN     "lastServiceKm" INTEGER,
ADD COLUMN     "originalRcAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerType" TEXT,
ADD COLUMN     "pucAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pucValidUntil" TIMESTAMP(3),
ADD COLUMN     "rcAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rcNotes" TEXT,
ADD COLUMN     "rcTransferAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registrationState" TEXT,
ADD COLUMN     "serviceHistoryAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "serviceHistoryNotes" TEXT,
ADD COLUMN     "warrantyAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "warrantyNotes" TEXT,
ADD COLUMN     "warrantyValidUntil" TIMESTAMP(3);

-- DropTable
DROP TABLE "CarDocument";

-- DropEnum
DROP TYPE "DocumentType";
