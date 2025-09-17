-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH', 'SMS');

-- CreateEnum
CREATE TYPE "public"."Theme" AS ENUM ('DARK', 'LIGHT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('EN', 'ES');

-- CreateEnum
CREATE TYPE "public"."Frequency" AS ENUM ('EVERY_10_MINUTES', 'EVERY_30_MINUTES', 'HOURLY', 'EVERY_6_HOURS', 'DAILY', 'EVERY_TWO_DAYS', 'EVERY_FOUR_DAYS', 'WEEKLY');

-- CreateEnum
CREATE TYPE "public"."RadarQuadrant" AS ENUM ('BUSSINESS_INTEL', 'SCIENTIFIC_STAGE', 'SUPPORT_PLATTFORMS_AND_TECHNOLOGIES', 'LANGUAGES_AND_FRAMEWORKS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."RadarRing" AS ENUM ('ADOPT', 'TEST', 'SUSTAIN', 'HOLD', 'UNKNOWN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserItemList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "preferredNotificationChannel" "public"."NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "UserItemList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPreferences" (
    "id" TEXT NOT NULL,
    "theme" "public"."Theme" NOT NULL DEFAULT 'SYSTEM',
    "language" "public"."Language" NOT NULL DEFAULT 'ES',
    "defaultNotificationChannel" "public"."NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "analysisFrequency" "public"."Frequency" NOT NULL DEFAULT 'EVERY_6_HOURS',
    "recommendationsUpdateFrequency" "public"."Frequency" NOT NULL DEFAULT 'DAILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ListItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ListItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ReportItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReportItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "public"."UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "_ListItems_B_index" ON "public"."_ListItems"("B");

-- CreateIndex
CREATE INDEX "_ReportItems_B_index" ON "public"."_ReportItems"("B");

-- AddForeignKey
ALTER TABLE "public"."UserItemList" ADD CONSTRAINT "UserItemList_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscribedItemAnalysis" ADD CONSTRAINT "SubscribedItemAnalysis_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."SurveyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ListItems" ADD CONSTRAINT "_ListItems_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."SurveyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ListItems" ADD CONSTRAINT "_ListItems_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."UserItemList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ReportItems" ADD CONSTRAINT "_ReportItems_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ReportItems" ADD CONSTRAINT "_ReportItems_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."SurveyItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
