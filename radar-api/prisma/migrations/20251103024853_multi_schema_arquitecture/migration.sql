/*
  Warnings:

  - You are about to drop the `GeneralSearchResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Insights` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SurveyItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserHiddenItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserItemList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPreferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSubscribedItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ListItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ReportItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tech_survey";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user_data";

-- CreateEnum
CREATE TYPE "user_data"."NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH', 'SMS');

-- CreateEnum
CREATE TYPE "user_data"."Theme" AS ENUM ('DARK', 'LIGHT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "user_data"."Language" AS ENUM ('EN', 'ES');

-- CreateEnum
CREATE TYPE "user_data"."Frequency" AS ENUM ('EVERY_10_MINUTES', 'EVERY_30_MINUTES', 'HOURLY', 'EVERY_6_HOURS', 'DAILY', 'EVERY_TWO_DAYS', 'EVERY_FOUR_DAYS', 'WEEKLY');

-- CreateEnum
CREATE TYPE "tech_survey"."RadarQuadrant" AS ENUM ('BUSSINESS_INTEL', 'SCIENTIFIC_STAGE', 'SUPPORT_PLATTFORMS_AND_TECHNOLOGIES', 'LANGUAGES_AND_FRAMEWORKS');

-- CreateEnum
CREATE TYPE "tech_survey"."RadarRing" AS ENUM ('ADOPT', 'TEST', 'SUSTAIN', 'HOLD', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "tech_survey"."Trending" AS ENUM ('UP', 'DOWN', 'STABLE', 'UNSTABLE');

-- CreateEnum
CREATE TYPE "tech_survey"."AccesibilityLevel" AS ENUM ('FREE', 'PAID');

-- DropForeignKey
ALTER TABLE "public"."ItemAnalysis" DROP CONSTRAINT "ItemAnalysis_dataId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemAnalysis" DROP CONSTRAINT "ItemAnalysis_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemAnalysis" DROP CONSTRAINT "ItemAnalysis_metricsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurveyItem" DROP CONSTRAINT "SurveyItem_insertedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserHiddenItem" DROP CONSTRAINT "UserHiddenItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserHiddenItem" DROP CONSTRAINT "UserHiddenItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserItemList" DROP CONSTRAINT "UserItemList_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserPreferences" DROP CONSTRAINT "UserPreferences_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserSubscribedItem" DROP CONSTRAINT "UserSubscribedItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserSubscribedItem" DROP CONSTRAINT "UserSubscribedItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ListItems" DROP CONSTRAINT "_ListItems_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ListItems" DROP CONSTRAINT "_ListItems_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ReportItems" DROP CONSTRAINT "_ReportItems_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ReportItems" DROP CONSTRAINT "_ReportItems_B_fkey";

-- DropTable
DROP TABLE "public"."GeneralSearchResult";

-- DropTable
DROP TABLE "public"."Insights";

-- DropTable
DROP TABLE "public"."ItemAnalysis";

-- DropTable
DROP TABLE "public"."Report";

-- DropTable
DROP TABLE "public"."SurveyItem";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."UserHiddenItem";

-- DropTable
DROP TABLE "public"."UserItemList";

-- DropTable
DROP TABLE "public"."UserPreferences";

-- DropTable
DROP TABLE "public"."UserSubscribedItem";

-- DropTable
DROP TABLE "public"."_ListItems";

-- DropTable
DROP TABLE "public"."_ReportItems";

-- DropEnum
DROP TYPE "public"."AccesibilityLevel";

-- DropEnum
DROP TYPE "public"."Frequency";

-- DropEnum
DROP TYPE "public"."Language";

-- DropEnum
DROP TYPE "public"."NotificationChannel";

-- DropEnum
DROP TYPE "public"."RadarQuadrant";

-- DropEnum
DROP TYPE "public"."RadarRing";

-- DropEnum
DROP TYPE "public"."Theme";

-- DropEnum
DROP TYPE "public"."Trending";

-- CreateTable
CREATE TABLE "user_data"."User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_data"."UserPreferences" (
    "id" TEXT NOT NULL,
    "theme" "user_data"."Theme" NOT NULL DEFAULT 'SYSTEM',
    "language" "user_data"."Language" NOT NULL DEFAULT 'ES',
    "defaultNotificationChannel" "user_data"."NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "analysisFrequency" "user_data"."Frequency" NOT NULL DEFAULT 'EVERY_6_HOURS',
    "recommendationsUpdateFrequency" "user_data"."Frequency" NOT NULL DEFAULT 'DAILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_data"."UserSubscribedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSubscribedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_data"."UserHiddenItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserHiddenItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_data"."UserItemList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "preferredNotificationChannel" "user_data"."NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "UserItemList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_data"."Report" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_survey"."SurveyItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "externalReferences" JSONB NOT NULL DEFAULT '[]',
    "consolidatedMetadata" JSONB NOT NULL DEFAULT '{}',
    "insights" JSONB NOT NULL DEFAULT '{}',
    "radarQuadrant" "tech_survey"."RadarQuadrant" NOT NULL,
    "radarRing" "tech_survey"."RadarRing" NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "insertedById" TEXT,

    CONSTRAINT "SurveyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_survey"."ItemMetadata" (
    "id" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mergedData" JSONB NOT NULL,

    CONSTRAINT "ItemMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_survey"."QuadrantInsights" (
    "id" TEXT NOT NULL,
    "citations" INTEGER NOT NULL,
    "downloads" INTEGER NOT NULL,
    "relevance" DOUBLE PRECISION NOT NULL,
    "accesibilityLevel" "tech_survey"."AccesibilityLevel" NOT NULL,
    "trending" "tech_survey"."Trending" NOT NULL,

    CONSTRAINT "QuadrantInsights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_survey"."ItemAnalysis" (
    "id" TEXT NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT NOT NULL,
    "metadataId" TEXT NOT NULL,
    "insightsId" TEXT NOT NULL,

    CONSTRAINT "ItemAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_survey"."RawData" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_data"."_ReportItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReportItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "tech_survey"."_ListItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ListItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "user_data"."User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "user_data"."UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscribedItem_userId_itemId_key" ON "user_data"."UserSubscribedItem"("userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "UserHiddenItem_userId_itemId_key" ON "user_data"."UserHiddenItem"("userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemAnalysis_metadataId_key" ON "tech_survey"."ItemAnalysis"("metadataId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemAnalysis_insightsId_key" ON "tech_survey"."ItemAnalysis"("insightsId");

-- CreateIndex
CREATE INDEX "_ReportItems_B_index" ON "user_data"."_ReportItems"("B");

-- CreateIndex
CREATE INDEX "_ListItems_B_index" ON "tech_survey"."_ListItems"("B");

-- AddForeignKey
ALTER TABLE "user_data"."UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_data"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data"."UserSubscribedItem" ADD CONSTRAINT "UserSubscribedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_data"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data"."UserSubscribedItem" ADD CONSTRAINT "UserSubscribedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "tech_survey"."SurveyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data"."UserHiddenItem" ADD CONSTRAINT "UserHiddenItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_data"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data"."UserHiddenItem" ADD CONSTRAINT "UserHiddenItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "tech_survey"."SurveyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data"."UserItemList" ADD CONSTRAINT "UserItemList_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user_data"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."SurveyItem" ADD CONSTRAINT "SurveyItem_insertedById_fkey" FOREIGN KEY ("insertedById") REFERENCES "user_data"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."ItemAnalysis" ADD CONSTRAINT "ItemAnalysis_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "tech_survey"."SurveyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."ItemAnalysis" ADD CONSTRAINT "ItemAnalysis_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "tech_survey"."ItemMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."ItemAnalysis" ADD CONSTRAINT "ItemAnalysis_insightsId_fkey" FOREIGN KEY ("insightsId") REFERENCES "tech_survey"."QuadrantInsights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data"."_ReportItems" ADD CONSTRAINT "_ReportItems_A_fkey" FOREIGN KEY ("A") REFERENCES "user_data"."Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data"."_ReportItems" ADD CONSTRAINT "_ReportItems_B_fkey" FOREIGN KEY ("B") REFERENCES "tech_survey"."SurveyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."_ListItems" ADD CONSTRAINT "_ListItems_A_fkey" FOREIGN KEY ("A") REFERENCES "tech_survey"."SurveyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."_ListItems" ADD CONSTRAINT "_ListItems_B_fkey" FOREIGN KEY ("B") REFERENCES "user_data"."UserItemList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
