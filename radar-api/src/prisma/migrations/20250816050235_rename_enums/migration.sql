/*
  Warnings:

  - Changed the type of `radarQuadrant` on the `FollowingItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `radarRing` on the `FollowingItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."RadarQuadrant" AS ENUM ('BUSSINESS_INTEL', 'SCIENTIFIC_STAGE', 'SUPPORT_PLATTFORMS_AND_TECHNOLOGIES', 'LANGUAGES_AND_FRAMEWORKS');

-- CreateEnum
CREATE TYPE "public"."RadarRing" AS ENUM ('ADOPT', 'TEST', 'SUSTAIN', 'HOLD');

-- AlterTable
ALTER TABLE "public"."FollowingItem" DROP COLUMN "radarQuadrant",
ADD COLUMN     "radarQuadrant" "public"."RadarQuadrant" NOT NULL,
DROP COLUMN "radarRing",
ADD COLUMN     "radarRing" "public"."RadarRing" NOT NULL;

-- DropEnum
DROP TYPE "public"."FollowingItemRadarQuadrant";

-- DropEnum
DROP TYPE "public"."FollowingItemRadarRing";
