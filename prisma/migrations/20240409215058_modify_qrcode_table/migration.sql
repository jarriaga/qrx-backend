/*
  Warnings:

  - You are about to drop the column `purchased` on the `Quser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Qrcode" DROP CONSTRAINT "Qrcode_quserId_fkey";

-- AlterTable
ALTER TABLE "Design" ADD COLUMN     "type" "QrType" NOT NULL DEFAULT 'TEXT';

-- AlterTable
ALTER TABLE "Qrcode" ADD COLUMN     "purchased" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "quserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Quser" DROP COLUMN "purchased";

-- AddForeignKey
ALTER TABLE "Qrcode" ADD CONSTRAINT "Qrcode_quserId_fkey" FOREIGN KEY ("quserId") REFERENCES "Quser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
