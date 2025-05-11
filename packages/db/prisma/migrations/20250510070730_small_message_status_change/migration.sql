/*
  Warnings:

  - You are about to drop the `_chatsSeenBy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_chatsSeenBy" DROP CONSTRAINT "_chatsSeenBy_A_fkey";

-- DropForeignKey
ALTER TABLE "_chatsSeenBy" DROP CONSTRAINT "_chatsSeenBy_B_fkey";

-- DropTable
DROP TABLE "_chatsSeenBy";
