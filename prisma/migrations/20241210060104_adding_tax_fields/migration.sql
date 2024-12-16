/*
  Warnings:

  - Added the required column `tax` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxRate` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tax" INTEGER NOT NULL,
ADD COLUMN     "taxRate" DOUBLE PRECISION NOT NULL;
