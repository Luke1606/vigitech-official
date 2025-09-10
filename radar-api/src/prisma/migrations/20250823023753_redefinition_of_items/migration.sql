/*
  Warnings:

  - The `sentState` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `analysisFrequency` column on the `UserPreferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `recommendationsUpdateFrequency` column on the `UserPreferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `FollowingItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemRecommendation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Frequency" AS ENUM ('EVERY_10_MINUTES', 'EVERY_30_MINUTES', 'HOURLY', 'EVERY_6_HOURS', 'DAILY', 'EVERY_TWO_DAYS', 'EVERY_FOUR_DAYS', 'WEEKLY');

-- CreateEnum
CREATE TYPE "public"."NotificationState" AS ENUM ('SENT', 'FAILED', 'SENDING');

-- DropForeignKey
ALTER TABLE "public"."ItemAnalysis" DROP CONSTRAINT "ItemAnalysis_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ListItems" DROP CONSTRAINT "_ListItems_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ReportItems" DROP CONSTRAINT "_ReportItems_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ReportItems" DROP CONSTRAINT "_ReportItems_B_fkey";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "sentState",
ADD COLUMN     "sentState" "public"."NotificationState" NOT NULL DEFAULT 'SENDING';

-- AlterTable
ALTER TABLE "public"."UserItemList" ADD COLUMN     "preferredNotificationChannel" "public"."NotificationChannel" NOT NULL DEFAULT 'IN_APP';

-- AlterTable
ALTER TABLE "public"."UserPreferences" DROP COLUMN "analysisFrequency",
ADD COLUMN     "analysisFrequency" "public"."Frequency" NOT NULL DEFAULT 'EVERY_6_HOURS',
DROP COLUMN "recommendationsUpdateFrequency",
ADD COLUMN     "recommendationsUpdateFrequency" "public"."Frequency" NOT NULL DEFAULT 'DAILY';

-- DropTable
DROP TABLE "public"."FollowingItem";

-- DropTable
DROP TABLE "public"."ItemRecommendation";

-- DropEnum
DROP TYPE "public"."NotificationSentState";

-- CreateTable
CREATE TABLE "public"."SurveyItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "radarQuadrant" "public"."RadarQuadrant" NOT NULL DEFAULT 'UNKNOWN',
    "radarRing" "public"."RadarRing" NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ItemAnalysis" ADD CONSTRAINT "ItemAnalysis_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."SurveyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ListItems" ADD CONSTRAINT "_ListItems_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."SurveyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ReportItems" ADD CONSTRAINT "_ReportItems_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ReportItems" ADD CONSTRAINT "_ReportItems_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."SurveyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
