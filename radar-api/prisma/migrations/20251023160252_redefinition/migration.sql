/*
  Warnings:

  - You are about to drop the column `unpaywallResult` on the `GeneralSearchResult` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `SurveyItem` table. All the data in the column will be lost.
  - You are about to drop the column `subscribed` on the `SurveyItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Metrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscribedItemAnalysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SubscribedItemAnalysis" DROP CONSTRAINT "SubscribedItemAnalysis_dataId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubscribedItemAnalysis" DROP CONSTRAINT "SubscribedItemAnalysis_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubscribedItemAnalysis" DROP CONSTRAINT "SubscribedItemAnalysis_metricsId_fkey";

-- AlterTable
ALTER TABLE "public"."GeneralSearchResult" DROP COLUMN "unpaywallResult";

-- AlterTable
ALTER TABLE "public"."SurveyItem" DROP COLUMN "active",
DROP COLUMN "subscribed";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "name";

-- DropTable
DROP TABLE "public"."Metrics";

-- DropTable
DROP TABLE "public"."SubscribedItemAnalysis";

-- CreateTable
CREATE TABLE "public"."UserSubscribedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSubscribedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserHiddenItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserHiddenItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Insights" (
    "id" TEXT NOT NULL,
    "citations" INTEGER NOT NULL,
    "downloads" INTEGER NOT NULL,
    "relevance" DOUBLE PRECISION NOT NULL,
    "accesibilityLevel" "public"."AccesibilityLevel" NOT NULL,
    "trending" "public"."Trending" NOT NULL,

    CONSTRAINT "Insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemAnalysis" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "itemId" TEXT NOT NULL,
    "dataId" TEXT NOT NULL,
    "metricsId" TEXT NOT NULL,

    CONSTRAINT "ItemAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscribedItem_userId_itemId_key" ON "public"."UserSubscribedItem"("userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "UserHiddenItem_userId_itemId_key" ON "public"."UserHiddenItem"("userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemAnalysis_dataId_key" ON "public"."ItemAnalysis"("dataId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemAnalysis_metricsId_key" ON "public"."ItemAnalysis"("metricsId");

-- AddForeignKey
ALTER TABLE "public"."UserSubscribedItem" ADD CONSTRAINT "UserSubscribedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSubscribedItem" ADD CONSTRAINT "UserSubscribedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."SurveyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserHiddenItem" ADD CONSTRAINT "UserHiddenItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserHiddenItem" ADD CONSTRAINT "UserHiddenItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."SurveyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemAnalysis" ADD CONSTRAINT "ItemAnalysis_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "public"."GeneralSearchResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemAnalysis" ADD CONSTRAINT "ItemAnalysis_metricsId_fkey" FOREIGN KEY ("metricsId") REFERENCES "public"."Insights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemAnalysis" ADD CONSTRAINT "ItemAnalysis_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."SurveyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
