/*
  Warnings:

  - The values [UNKNOWN] on the enum `RadarQuadrant` will be removed. If these variants are still used in the database, this will fail.
  - The values [UNKNOWN] on the enum `RadarRing` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `obtainedMetrics` on the `SubscribedItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `searchedData` on the `SubscribedItemAnalysis` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dataId]` on the table `SubscribedItemAnalysis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[metricsId]` on the table `SubscribedItemAnalysis` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dataId` to the `SubscribedItemAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metricsId` to the `SubscribedItemAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Trending" AS ENUM ('UP', 'DOWN', 'STABLE', 'UNSTABLE');

-- CreateEnum
CREATE TYPE "public"."AccesibilityLevel" AS ENUM ('FREE', 'PAID');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."RadarQuadrant_new" AS ENUM ('BUSSINESS_INTEL', 'SCIENTIFIC_STAGE', 'SUPPORT_PLATTFORMS_AND_TECHNOLOGIES', 'LANGUAGES_AND_FRAMEWORKS');
ALTER TABLE "public"."SurveyItem" ALTER COLUMN "radarQuadrant" DROP DEFAULT;
ALTER TABLE "public"."SurveyItem" ALTER COLUMN "radarQuadrant" TYPE "public"."RadarQuadrant_new" USING ("radarQuadrant"::text::"public"."RadarQuadrant_new");
ALTER TYPE "public"."RadarQuadrant" RENAME TO "RadarQuadrant_old";
ALTER TYPE "public"."RadarQuadrant_new" RENAME TO "RadarQuadrant";
DROP TYPE "public"."RadarQuadrant_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."RadarRing_new" AS ENUM ('ADOPT', 'TEST', 'SUSTAIN', 'HOLD');
ALTER TABLE "public"."SurveyItem" ALTER COLUMN "radarRing" DROP DEFAULT;
ALTER TABLE "public"."SurveyItem" ALTER COLUMN "radarRing" TYPE "public"."RadarRing_new" USING ("radarRing"::text::"public"."RadarRing_new");
ALTER TYPE "public"."RadarRing" RENAME TO "RadarRing_old";
ALTER TYPE "public"."RadarRing_new" RENAME TO "RadarRing";
DROP TYPE "public"."RadarRing_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."SubscribedItemAnalysis" DROP COLUMN "obtainedMetrics",
DROP COLUMN "searchedData",
ADD COLUMN     "dataId" TEXT NOT NULL,
ADD COLUMN     "metricsId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SurveyItem" ALTER COLUMN "radarQuadrant" DROP DEFAULT,
ALTER COLUMN "radarRing" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."GeneralSearchResult" (
    "id" TEXT NOT NULL,
    "crossRefResult" JSONB NOT NULL,
    "lensResult" JSONB NOT NULL,
    "openAlexResult" JSONB NOT NULL,
    "unpaywallResult" JSONB NOT NULL,

    CONSTRAINT "GeneralSearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Metrics" (
    "id" TEXT NOT NULL,
    "citations" INTEGER NOT NULL,
    "downloads" INTEGER NOT NULL,
    "relevance" DOUBLE PRECISION NOT NULL,
    "accesibilityLevel" "public"."AccesibilityLevel" NOT NULL,
    "trending" "public"."Trending" NOT NULL,

    CONSTRAINT "Metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscribedItemAnalysis_dataId_key" ON "public"."SubscribedItemAnalysis"("dataId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscribedItemAnalysis_metricsId_key" ON "public"."SubscribedItemAnalysis"("metricsId");

-- AddForeignKey
ALTER TABLE "public"."SubscribedItemAnalysis" ADD CONSTRAINT "SubscribedItemAnalysis_dataId_fkey" FOREIGN KEY ("dataId") REFERENCES "public"."GeneralSearchResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscribedItemAnalysis" ADD CONSTRAINT "SubscribedItemAnalysis_metricsId_fkey" FOREIGN KEY ("metricsId") REFERENCES "public"."Metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
