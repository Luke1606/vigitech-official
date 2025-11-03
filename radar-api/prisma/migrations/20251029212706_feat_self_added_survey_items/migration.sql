-- AlterTable
ALTER TABLE "SurveyItem" ADD COLUMN     "insertedById" TEXT;

-- AddForeignKey
ALTER TABLE "SurveyItem" ADD CONSTRAINT "SurveyItem_insertedById_fkey" FOREIGN KEY ("insertedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
