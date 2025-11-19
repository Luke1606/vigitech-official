/*
  Warnings:

  - The values [REPOSITORY,ARTICLE,PACKAGE,QUESTION,NEWS_ITEM,BLOG_POST,RESEARCH_PAPER,SURVEY_REPORT,PRODUCT_LISTING,FORUM_DISCUSSION] on the enum `RawDataType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "tech_survey"."RawDataType_new" AS ENUM ('CODE_ASSET', 'TEXT_CONTENT', 'ACADEMIC_PAPER', 'REPORT_OR_PRODUCT', 'COMMUNITY_POST', 'DATASET');
ALTER TABLE "tech_survey"."RawData" ALTER COLUMN "dataType" TYPE "tech_survey"."RawDataType_new" USING ("dataType"::text::"tech_survey"."RawDataType_new");
ALTER TYPE "tech_survey"."RawDataType" RENAME TO "RawDataType_old";
ALTER TYPE "tech_survey"."RawDataType_new" RENAME TO "RawDataType";
DROP TYPE "tech_survey"."RawDataType_old";
COMMIT;
