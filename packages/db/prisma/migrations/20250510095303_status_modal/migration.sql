/*
  Warnings:

  - Made the column `deliveredAt` on table `MessageStatus` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MessageStatus" ALTER COLUMN "deliveredAt" SET NOT NULL,
ALTER COLUMN "deliveredAt" SET DEFAULT CURRENT_TIMESTAMP;
