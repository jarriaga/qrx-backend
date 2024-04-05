-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "html" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quserId" TEXT,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_quserId_fkey" FOREIGN KEY ("quserId") REFERENCES "Quser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
