import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    console.log("🔧 Checking AlbumItem table structure...");

    // Try to query with the new fields to see if they exist
    const testQuery = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'AlbumItem';
    `;

    console.log("📊 Current columns:", testQuery);

    // Try to add the columns if they don't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "AlbumItem" 
      ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "AlbumItem" 
      ADD COLUMN IF NOT EXISTS "notes" TEXT;
    `);

    console.log("✅ Columns added successfully!");

    // Verify
    const afterQuery = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'AlbumItem';
    `;

    console.log("📊 Updated columns:", afterQuery);
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
