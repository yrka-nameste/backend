-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "closedReason" TEXT,
ADD COLUMN     "isChargeable" BOOLEAN NOT NULL DEFAULT true;
