-- CreateEnum
CREATE TYPE "MESSAGE_STATUS" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "status" "MESSAGE_STATUS" NOT NULL DEFAULT 'PENDING';
