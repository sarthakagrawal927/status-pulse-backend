/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `createdById` to the `StatusUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `StatusUpdate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'REMOVED_BY_SELF', 'REMOVED_BY_ADMIN', 'INVITATION_PENDING', 'INVITATION_REJECTED', 'INVITATION_REVOKED');

-- AlterTable
ALTER TABLE "StatusUpdate" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "status" "IncidentStatus" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "Role";

-- CreateIndex
CREATE INDEX "StatusUpdate_createdById_idx" ON "StatusUpdate"("createdById");

-- AddForeignKey
ALTER TABLE "StatusUpdate" ADD CONSTRAINT "StatusUpdate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
