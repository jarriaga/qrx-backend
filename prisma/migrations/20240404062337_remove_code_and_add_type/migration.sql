/*
  Warnings:

  - You are about to drop the column `code` on the `Qrcode` table. All the data in the column will be lost.
  - Added the required column `type` to the `Qrcode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Qrcode" DROP COLUMN "code",
ADD COLUMN     "type" "QrType" NOT NULL;
