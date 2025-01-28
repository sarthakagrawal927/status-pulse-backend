/*
  Warnings:

  - The values [MAINTENANCE_SCHEDULED,MAINTENANCE_STARTED,MAINTENANCE_COMPLETED] on the enum `ActionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [SCHEDULED_MAINTENANCE,UNDER_MAINTENANCE,MAINTENANCE_COMPLETED] on the enum `ServiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `UserAction` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActionType_new" AS ENUM ('INCIDENT_CREATED', 'INCIDENT_UPDATED', 'INCIDENT_RESOLVED', 'SERVICE_STATUS_CHANGED', 'MEMBER_INVITED', 'MEMBER_JOINED', 'MEMBER_REMOVED', 'MEMBER_LEFT', 'ROLE_UPDATED');
ALTER TABLE "UserAction" ALTER COLUMN "actionType" TYPE "ActionType_new" USING ("actionType"::text::"ActionType_new");
ALTER TYPE "ActionType" RENAME TO "ActionType_old";
ALTER TYPE "ActionType_new" RENAME TO "ActionType";
DROP TYPE "ActionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ServiceStatus_new" AS ENUM ('OPERATIONAL', 'DEGRADED_PERFORMANCE', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE', 'MAINTENANCE');
ALTER TABLE "Service" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Service" ALTER COLUMN "status" TYPE "ServiceStatus_new" USING ("status"::text::"ServiceStatus_new");
ALTER TYPE "ServiceStatus" RENAME TO "ServiceStatus_old";
ALTER TYPE "ServiceStatus_new" RENAME TO "ServiceStatus";
DROP TYPE "ServiceStatus_old";
ALTER TABLE "Service" ALTER COLUMN "status" SET DEFAULT 'OPERATIONAL';
COMMIT;

-- AlterTable
ALTER TABLE "UserAction" DROP COLUMN "description";
