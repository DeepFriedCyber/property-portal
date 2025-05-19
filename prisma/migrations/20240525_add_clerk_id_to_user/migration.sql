-- AlterTable
ALTER TABLE "User" 
ADD COLUMN "clerkId" TEXT,
ADD COLUMN "role" TEXT,
ALTER COLUMN "id" SET DEFAULT cuid();

-- After adding the column, we need to make it unique
-- But first, we need to ensure there are no null values
-- This is a placeholder - in a real migration, you would need to handle existing data
-- For example, you might set a default value or delete records without a clerkId

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- Note: In a production environment, you would need to handle existing data
-- by either providing default values or migrating data from another source