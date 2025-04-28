/*
  Warnings:

  - A unique constraint covering the columns `[qrCodeId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderItemId]` on the table `Qrcode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "qrCodeId" TEXT;

-- AlterTable
ALTER TABLE "Qrcode" ADD COLUMN     "orderItemId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_qrCodeId_key" ON "OrderItem"("qrCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Qrcode_orderItemId_key" ON "Qrcode"("orderItemId");

-- AddForeignKey
ALTER TABLE "Qrcode" ADD CONSTRAINT "Qrcode_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
