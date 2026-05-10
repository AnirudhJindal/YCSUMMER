/*
  Warnings:

  - Added the required column `valueHash` to the `TokenVault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TokenVault" ADD COLUMN     "valueHash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "TokenVault_valueHash_userId_idx" ON "TokenVault"("valueHash", "userId");
