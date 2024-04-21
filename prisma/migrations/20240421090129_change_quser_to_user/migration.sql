/*
  Warnings:

  - You are about to drop the column `quserId` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the column `quserId` on the `Qrcode` table. All the data in the column will be lost.
  - You are about to drop the `Quser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Design" DROP CONSTRAINT "Design_quserId_fkey";

-- DropForeignKey
ALTER TABLE "Qrcode" DROP CONSTRAINT "Qrcode_quserId_fkey";

-- AlterTable
ALTER TABLE "Design" DROP COLUMN "quserId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Qrcode" DROP COLUMN "quserId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "Quser";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT,
    "smsCode" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Qrcode" ADD CONSTRAINT "Qrcode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
