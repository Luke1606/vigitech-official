/*
  Warnings:

  - You are about to drop the `ItemAnalysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ItemAnalysis" DROP CONSTRAINT "ItemAnalysis_itemId_fkey";

-- DropTable
DROP TABLE "public"."ItemAnalysis";

-- CreateTable
CREATE TABLE "public"."SubscribedItemAnalysis" (
    "id" TEXT NOT NULL,
    "searchedData" JSONB NOT NULL,
    "obtainedMetrics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "SubscribedItemAnalysis_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SubscribedItemAnalysis" ADD CONSTRAINT "SubscribedItemAnalysis_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."SurveyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
