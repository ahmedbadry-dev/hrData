-- AlterTable
ALTER TABLE "users" ADD COLUMN "last_quota_reset_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_quota_resets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reset_by_id" TEXT,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quota_resets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_quota_resets_user_id_created_at_idx" ON "user_quota_resets"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_quota_resets_reset_by_id_created_at_idx" ON "user_quota_resets"("reset_by_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_quota_resets" ADD CONSTRAINT "user_quota_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quota_resets" ADD CONSTRAINT "user_quota_resets_reset_by_id_fkey" FOREIGN KEY ("reset_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
