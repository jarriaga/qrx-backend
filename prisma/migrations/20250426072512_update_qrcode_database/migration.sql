/*
  Warnings:

  - You are about to drop the column `activationCode` on the `Qrcode` table. All the data in the column will be lost.
  - You are about to drop the column `purchased` on the `Qrcode` table. All the data in the column will be lost.
  - You are about to drop the column `shirtId` on the `Qrcode` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Qrcode_activationCode_key";

-- DropIndex
DROP INDEX "Qrcode_shirtId_key";

-- AlterTable
ALTER TABLE "Qrcode" DROP COLUMN "activationCode",
DROP COLUMN "purchased",
DROP COLUMN "shirtId";
