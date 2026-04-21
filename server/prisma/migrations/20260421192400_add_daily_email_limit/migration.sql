-- AlterTable
ALTER TABLE "users"
ADD COLUMN "daily_email_limit" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "limit_reached_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "applications_user_id_status_created_at_idx"
ON "applications"("user_id", "status", "created_at");
