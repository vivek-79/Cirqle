/*
  Warnings:

  - A unique constraint covering the columns `[userId,messageId]` on the table `MessageStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MessageStatus" DROP CONSTRAINT "MessageStatus_messageId_fkey";

-- DropForeignKey
ALTER TABLE "MessageStatus" DROP CONSTRAINT "MessageStatus_userId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'SENT';

-- AlterTable
ALTER TABLE "MessageStatus" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "seenAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "MessageStatus_userId_messageId_key" ON "MessageStatus"("userId", "messageId");

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
