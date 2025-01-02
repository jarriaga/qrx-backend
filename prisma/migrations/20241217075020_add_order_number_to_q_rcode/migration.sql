/*
  Warnings:

  - You are about to drop the column `shirtId` on the `Qrcode` table. All the data in the column will be lost.
  - Added the required column `orderNumber` to the `Qrcode` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Qrcode_shirtId_key";

-- AlterTable
ALTER TABLE "Qrcode" DROP COLUMN "shirtId",
ADD COLUMN     "orderNumber" TEXT NOT NULL;
