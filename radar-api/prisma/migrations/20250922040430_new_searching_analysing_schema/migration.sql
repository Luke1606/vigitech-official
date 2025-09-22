/*
  Warnings:

  - You are about to drop the column `lensResult` on the `GeneralSearchResult` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."RadarRing" ADD VALUE 'UNKNOWN';

-- AlterTable
ALTER TABLE "public"."GeneralSearchResult" DROP COLUMN "lensResult";

-- AlterTable
ALTER TABLE "public"."SurveyItem" ALTER COLUMN "radarRing" SET DEFAULT 'UNKNOWN';
