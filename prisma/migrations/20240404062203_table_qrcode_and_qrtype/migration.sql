-- CreateEnum
CREATE TYPE "QrType" AS ENUM ('REDIRECTION', 'CONTACT', 'PAYPAL', 'CASHAPP', 'TEXT', 'GIFT', 'VIDEO');

-- CreateTable
CREATE TABLE "Qrcode" (
    "id" TEXT NOT NULL,
    "quserId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Qrcode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Qrcode" ADD CONSTRAINT "Qrcode_quserId_fkey" FOREIGN KEY ("quserId") REFERENCES "Quser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
