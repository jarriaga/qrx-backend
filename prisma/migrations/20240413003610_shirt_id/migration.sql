/*
  Warnings:

  - A unique constraint covering the columns `[shirtId]` on the table `Qrcode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shirtId` to the `Qrcode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Qrcode" ADD COLUMN     "shirtId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Qrcode_shirtId_key" ON "Qrcode"("shirtId");
