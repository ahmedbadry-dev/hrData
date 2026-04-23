/*
  Warnings:

  - You are about to drop the column `email_template_id` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `email_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_email_template_id_fkey";

-- DropForeignKey
ALTER TABLE "email_templates" DROP CONSTRAINT "email_templates_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "email_template_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "full_name";

-- DropTable
DROP TABLE "email_templates";

-- DropTable
DROP TABLE "sessions";

-- CreateTable
CREATE TABLE "scraped_logs" (
    "id" TEXT NOT NULL,
    "site_name" TEXT NOT NULL,
    "links_found" INTEGER NOT NULL DEFAULT 0,
    "jobs_scraped" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "error_message" TEXT,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scraped_logs_pkey" PRIMARY KEY ("id")
);
