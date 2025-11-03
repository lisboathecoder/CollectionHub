-- CreateTable
CREATE TABLE "Set" (
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "count" INTEGER,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Pack" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "setCode" TEXT NOT NULL,

    CONSTRAINT "Pack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rarity" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Rarity_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "setCode" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "nameEn" TEXT,
    "slug" TEXT,
    "imageName" TEXT,
    "rarityCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CardToPack" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CardToPack_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pack_setCode_name_key" ON "Pack"("setCode", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Card_setCode_number_key" ON "Card"("setCode", "number");

-- CreateIndex
CREATE INDEX "_CardToPack_B_index" ON "_CardToPack"("B");

-- AddForeignKey
ALTER TABLE "Pack" ADD CONSTRAINT "Pack_setCode_fkey" FOREIGN KEY ("setCode") REFERENCES "Set"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_setCode_fkey" FOREIGN KEY ("setCode") REFERENCES "Set"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_rarityCode_fkey" FOREIGN KEY ("rarityCode") REFERENCES "Rarity"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToPack" ADD CONSTRAINT "_CardToPack_A_fkey" FOREIGN KEY ("A") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToPack" ADD CONSTRAINT "_CardToPack_B_fkey" FOREIGN KEY ("B") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
