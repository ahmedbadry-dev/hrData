/*
  Warnings:

  - You are about to drop the column `cv_id` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the `cvs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'EMAIL_FAILED';

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_cv_id_fkey";

-- DropForeignKey
ALTER TABLE "cvs" DROP CONSTRAINT "cvs_user_id_fkey";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "cv_id";

-- DropTable
DROP TABLE "cvs";
