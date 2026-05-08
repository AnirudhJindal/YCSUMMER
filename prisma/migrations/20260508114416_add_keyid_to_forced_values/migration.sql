-- AlterTable
ALTER TABLE "UserForcedMaskValue" ADD COLUMN     "keyId" TEXT;

-- AddForeignKey
ALTER TABLE "UserForcedMaskValue" ADD CONSTRAINT "UserForcedMaskValue_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
