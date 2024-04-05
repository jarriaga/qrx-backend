-- CreateTable
CREATE TABLE "Quser" (
    "id" TEXT NOT NULL,
    "firstname" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quser_pkey" PRIMARY KEY ("id")
);
