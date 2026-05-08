/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `TokenVault` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "UserForcedMaskValue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserForcedMaskValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserForcedMaskValue_token_key" ON "UserForcedMaskValue"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TokenVault_token_key" ON "TokenVault"("token");

-- AddForeignKey
ALTER TABLE "UserForcedMaskValue" ADD CONSTRAINT "UserForcedMaskValue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserForcedMaskValue" ADD CONSTRAINT "UserForcedMaskValue_token_fkey" FOREIGN KEY ("token") REFERENCES "TokenVault"("token") ON DELETE RESTRICT ON UPDATE CASCADE;
