-- AlterTable
ALTER TABLE "maintenance_request" ADD COLUMN     "work_center_id" UUID;

-- CreateTable
CREATE TABLE "work_center" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "type" VARCHAR(100),
    "tag" VARCHAR(100),
    "location" VARCHAR(200),
    "cost_per_hour" DECIMAL(10,2),
    "capacity" INTEGER DEFAULT 1,
    "time_efficiency" INTEGER DEFAULT 100,
    "oee_target" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_center_worker" (
    "id" UUID NOT NULL,
    "work_center_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_center_worker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_center_code_key" ON "work_center"("code");

-- CreateIndex
CREATE UNIQUE INDEX "work_center_worker_work_center_id_user_id_key" ON "work_center_worker"("work_center_id", "user_id");

-- AddForeignKey
ALTER TABLE "work_center_worker" ADD CONSTRAINT "work_center_worker_work_center_id_fkey" FOREIGN KEY ("work_center_id") REFERENCES "work_center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_center_worker" ADD CONSTRAINT "work_center_worker_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_work_center_id_fkey" FOREIGN KEY ("work_center_id") REFERENCES "work_center"("id") ON DELETE SET NULL ON UPDATE CASCADE;
