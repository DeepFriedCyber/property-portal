-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "councilTaxBand" TEXT,
ADD COLUMN     "epcRating" TEXT,
ADD COLUMN     "postcode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tenure" TEXT;
