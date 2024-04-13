/*
  Warnings:

  - You are about to drop the column `pinCode` on the `Qrcode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[activationCode]` on the table `Qrcode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activationCode` to the `Qrcode` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Qrcode_pinCode_key";

-- AlterTable
ALTER TABLE "Qrcode" DROP COLUMN "pinCode",
ADD COLUMN     "activationCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Qrcode_activationCode_key" ON "Qrcode"("activationCode");
