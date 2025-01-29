-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActionType" ADD VALUE 'MAINTENANCE_SCHEDULED';
ALTER TYPE "ActionType" ADD VALUE 'MAINTENANCE_STARTED';
ALTER TYPE "ActionType" ADD VALUE 'MAINTENANCE_COMPLETED';

-- CreateTable
CREATE TABLE "ServiceMaintenance" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ServiceMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceMaintenance_serviceId_idx" ON "ServiceMaintenance"("serviceId");

-- AddForeignKey
ALTER TABLE "ServiceMaintenance" ADD CONSTRAINT "ServiceMaintenance_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
