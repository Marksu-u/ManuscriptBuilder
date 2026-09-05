-- CreateEnum
CREATE TYPE "AppSource" AS ENUM ('DYNASTY_TREE_BUILDER');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('ILLEGAL_CONTENT', 'HATE_SPEECH', 'SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "source" "AppSource" NOT NULL,
    "shareSlug" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_source_idx" ON "reports"("source");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");
