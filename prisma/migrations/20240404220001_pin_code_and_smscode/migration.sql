/*
  Warnings:

  - A unique constraint covering the columns `[pinCode]` on the table `Qrcode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pinCode` to the `Qrcode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Qrcode" ADD COLUMN     "pinCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quser" ADD COLUMN     "smsCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Qrcode_pinCode_key" ON "Qrcode"("pinCode");
