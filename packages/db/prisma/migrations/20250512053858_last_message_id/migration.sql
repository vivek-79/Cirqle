/*
  Warnings:

  - You are about to drop the column `lastMessage` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `lastMessageAt` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "lastMessage",
DROP COLUMN "lastMessageAt",
ADD COLUMN     "lastMessageId" TEXT;
