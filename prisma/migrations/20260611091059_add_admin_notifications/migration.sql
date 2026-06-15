-- CreateEnum
CREATE TYPE "AdminNotificationType" AS ENUM ('PAYMENT_CREATED', 'SHOP_ORDER_CREATED');

-- CreateEnum
CREATE TYPE "AdminNotificationStatus" AS ENUM ('UNREAD', 'READ');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'ADMIN_PANEL';

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "type" "AdminNotificationType" NOT NULL,
    "status" "AdminNotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminNotification_branchId_status_idx" ON "AdminNotification"("branchId", "status");

-- CreateIndex
CREATE INDEX "AdminNotification_branchId_type_idx" ON "AdminNotification"("branchId", "type");

-- CreateIndex
CREATE INDEX "AdminNotification_entity_entityId_idx" ON "AdminNotification"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
