/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Set` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Set" DROP COLUMN "imageUrl";
