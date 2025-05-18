-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);
