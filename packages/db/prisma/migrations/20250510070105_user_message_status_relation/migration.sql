/*
  Warnings:

  - You are about to drop the column `status` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "status";

-- DropEnum
DROP TYPE "MESSAGE_STATUS";

-- CreateTable
CREATE TABLE "MessageStatus" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "messageId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'SENT',

    CONSTRAINT "MessageStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
