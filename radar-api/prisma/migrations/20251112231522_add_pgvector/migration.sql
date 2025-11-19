CREATE EXTENSION IF NOT EXISTS vector;
/*
  Warnings:

  - You are about to drop the column `insightsId` on the `ItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `metadataId` on the `ItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `RawData` table. All the data in the column will be lost.
  - You are about to drop the `ItemMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuadrantInsights` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SurveyItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ReportItems` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `insightsValues` to the `ItemAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `radarRing` to the `ItemAnalysis` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `source` on the `RawData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dataType` on the `RawData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "tech_survey"."Field" AS ENUM ('BUSSINESS_INTEL', 'SCIENTIFIC_STAGE', 'SUPPORT_PLATTFORMS_AND_TECHNOLOGIES', 'LANGUAGES_AND_FRAMEWORKS');

-- CreateEnum
CREATE TYPE "tech_survey"."Classification" AS ENUM ('ADOPT', 'TEST', 'SUSTAIN', 'HOLD');

-- CreateEnum
CREATE TYPE "tech_survey"."RawDataSource" AS ENUM ('ARXIV_ORG', 'CROSS_REF', 'DEV_TO', 'DOCKER_HUB', 'GITHUB', 'GITHUB_OCTOVERSE', 'GITLAB', 'GOOGLE_BOOKS', 'HACKER_NEWS', 'HASHNODE', 'HUGGING_FACE_HUB', 'KAGGLE', 'KUBERNETES', 'MAVEN', 'MEDIA_WIKI', 'MEETUP', 'NEWS_API', 'NPM', 'OPEN_ALEX', 'PAPERS_WITH_CODE', 'PRODUCT_HUNT', 'PYPI', 'REDDIT', 'RSS', 'SEMANTIC_SCHOLAR', 'STACK_EXCHANGE', 'STACK_OVERFLOW_SURVEY');

-- CreateEnum
CREATE TYPE "tech_survey"."RawDataType" AS ENUM ('REPOSITORY', 'DATASET', 'ARTICLE', 'PACKAGE', 'QUESTION', 'NEWS_ITEM', 'BLOG_POST', 'RESEARCH_PAPER', 'SURVEY_REPORT', 'PRODUCT_LISTING', 'FORUM_DISCUSSION');

-- DropForeignKey
ALTER TABLE "tech_survey"."ItemAnalysis" DROP CONSTRAINT "ItemAnalysis_insightsId_fkey";

-- DropForeignKey
ALTER TABLE "tech_survey"."ItemAnalysis" DROP CONSTRAINT "ItemAnalysis_itemId_fkey";

-- DropForeignKey
ALTER TABLE "tech_survey"."ItemAnalysis" DROP CONSTRAINT "ItemAnalysis_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "tech_survey"."SurveyItem" DROP CONSTRAINT "SurveyItem_insertedById_fkey";

-- DropForeignKey
ALTER TABLE "tech_survey"."_ListItems" DROP CONSTRAINT "_ListItems_A_fkey";

-- DropForeignKey
ALTER TABLE "user_data"."UserHiddenItem" DROP CONSTRAINT "UserHiddenItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "user_data"."UserSubscribedItem" DROP CONSTRAINT "UserSubscribedItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "user_data"."_ReportItems" DROP CONSTRAINT "_ReportItems_A_fkey";

-- DropForeignKey
ALTER TABLE "user_data"."_ReportItems" DROP CONSTRAINT "_ReportItems_B_fkey";

-- DropIndex
DROP INDEX "tech_survey"."ItemAnalysis_insightsId_key";

-- DropIndex
DROP INDEX "tech_survey"."ItemAnalysis_metadataId_key";

-- AlterTable
ALTER TABLE "tech_survey"."ItemAnalysis" DROP COLUMN "insightsId",
DROP COLUMN "metadataId",
ADD COLUMN     "insightsValues" JSONB NOT NULL,
ADD COLUMN     "radarRing" "tech_survey"."Classification" NOT NULL;

-- AlterTable
ALTER TABLE "tech_survey"."RawData" DROP COLUMN "createdAt",
ADD COLUMN     "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "source",
ADD COLUMN     "source" "tech_survey"."RawDataSource" NOT NULL,
DROP COLUMN "dataType",
ADD COLUMN     "dataType" "tech_survey"."RawDataType" NOT NULL;

-- DropTable
DROP TABLE "tech_survey"."ItemMetadata";

-- DropTable
DROP TABLE "tech_survey"."QuadrantInsights";

-- DropTable
DROP TABLE "tech_survey"."SurveyItem";

-- DropTable
DROP TABLE "user_data"."_ReportItems";

-- DropEnum
DROP TYPE "tech_survey"."AccesibilityLevel";

-- DropEnum
DROP TYPE "tech_survey"."RadarQuadrant";

-- DropEnum
DROP TYPE "tech_survey"."RadarRing";

-- DropEnum
DROP TYPE "tech_survey"."Trending";

-- CreateTable
CREATE TABLE "tech_survey"."KnowledgeFragment" (
    "id" TEXT NOT NULL,
    "textSnippet" TEXT NOT NULL,
    "embedding" vector NOT NULL,
    "associatedKPIs" JSONB NOT NULL DEFAULT '{}',
    "sourceRawDataId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeFragment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_survey"."Item" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "itemField" "tech_survey"."Field" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "latestClassificationId" TEXT,
    "insertedById" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_survey"."ItemCitedFragment" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "fragmentId" TEXT NOT NULL,

    CONSTRAINT "ItemCitedFragment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_survey"."_ReportItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReportItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_latestClassificationId_key" ON "tech_survey"."Item"("latestClassificationId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCitedFragment_itemId_fragmentId_key" ON "tech_survey"."ItemCitedFragment"("itemId", "fragmentId");

-- CreateIndex
CREATE INDEX "_ReportItems_B_index" ON "tech_survey"."_ReportItems"("B");

-- AddForeignKey
ALTER TABLE "user_data"."UserSubscribedItem" ADD CONSTRAINT "UserSubscribedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "tech_survey"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_data"."UserHiddenItem" ADD CONSTRAINT "UserHiddenItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "tech_survey"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."KnowledgeFragment" ADD CONSTRAINT "KnowledgeFragment_sourceRawDataId_fkey" FOREIGN KEY ("sourceRawDataId") REFERENCES "tech_survey"."RawData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."Item" ADD CONSTRAINT "Item_latestClassificationId_fkey" FOREIGN KEY ("latestClassificationId") REFERENCES "tech_survey"."ItemAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."Item" ADD CONSTRAINT "Item_insertedById_fkey" FOREIGN KEY ("insertedById") REFERENCES "user_data"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."ItemAnalysis" ADD CONSTRAINT "ItemAnalysis_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "tech_survey"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."ItemCitedFragment" ADD CONSTRAINT "ItemCitedFragment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "tech_survey"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."ItemCitedFragment" ADD CONSTRAINT "ItemCitedFragment_fragmentId_fkey" FOREIGN KEY ("fragmentId") REFERENCES "tech_survey"."KnowledgeFragment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."_ListItems" ADD CONSTRAINT "_ListItems_A_fkey" FOREIGN KEY ("A") REFERENCES "tech_survey"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."_ReportItems" ADD CONSTRAINT "_ReportItems_A_fkey" FOREIGN KEY ("A") REFERENCES "tech_survey"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tech_survey"."_ReportItems" ADD CONSTRAINT "_ReportItems_B_fkey" FOREIGN KEY ("B") REFERENCES "user_data"."Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
