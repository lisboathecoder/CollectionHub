-- Quick fix: Add missing columns to AlbumItem
-- Run this directly in your PostgreSQL database

ALTER TABLE "AlbumItem" 
ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "AlbumItem" 
ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'AlbumItem'
ORDER BY ordinal_position;
