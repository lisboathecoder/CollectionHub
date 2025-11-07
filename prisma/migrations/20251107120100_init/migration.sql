/*
  Warnings:

  - Added the required column `moedaId` to the `Collection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "moedaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "moedaId" INTEGER;

-- CreateTable
CREATE TABLE "Country" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Moeda" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "material" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "valorFacial" TEXT NOT NULL,
    "descricao" TEXT,
    "peso_g" DOUBLE PRECISION,
    "imageNameAnverso" TEXT,
    "imageNameReverso" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Moeda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Moeda_countryCode_nome_ano_key" ON "Moeda"("countryCode", "nome", "ano");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_moedaId_fkey" FOREIGN KEY ("moedaId") REFERENCES "Moeda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_moedaId_fkey" FOREIGN KEY ("moedaId") REFERENCES "Moeda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moeda" ADD CONSTRAINT "Moeda_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
