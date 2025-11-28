/*
  Warnings:

  - You are about to drop the column `notes` on the `AlbumItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `AlbumItem` table. All the data in the column will be lost.
  - You are about to drop the column `requesterId` on the `Friendship` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[initiatorId,receiverId]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `initiatorId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_requesterId_fkey";

-- DropIndex
DROP INDEX "Friendship_requesterId_receiverId_key";

-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "AlbumItem" DROP COLUMN "notes",
DROP COLUMN "quantity";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "requesterId",
ADD COLUMN     "initiatorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_initiatorId_receiverId_key" ON "Friendship"("initiatorId", "receiverId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
