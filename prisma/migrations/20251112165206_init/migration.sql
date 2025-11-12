/*
  Warnings:

  - You are about to drop the column `moedaId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Moeda` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_moedaId_fkey";

-- DropForeignKey
ALTER TABLE "Moeda" DROP CONSTRAINT "Moeda_countryCode_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_moedaId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "moedaId";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "Moeda";
