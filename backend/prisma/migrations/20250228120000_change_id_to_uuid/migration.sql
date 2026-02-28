-- AlterTable
-- Step 1: Add new UUID column
ALTER TABLE "Invoice" ADD COLUMN "id_new" UUID;

-- Step 2: Generate UUIDs for existing rows
UPDATE "Invoice" SET "id_new" = gen_random_uuid();

-- Step 3: Drop primary key and old column
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_pkey";
ALTER TABLE "Invoice" DROP COLUMN "id";

-- Step 4: Rename new column and set as primary key
ALTER TABLE "Invoice" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id");

-- Step 5: Set default for new rows
ALTER TABLE "Invoice" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
