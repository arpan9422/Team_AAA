-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "manufacturer" VARCHAR(100),
ADD COLUMN     "model" VARCHAR(100),
ADD COLUMN     "type" VARCHAR(100),
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "equipment_assignment" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "equipment_assignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "equipment_assignment" ADD CONSTRAINT "equipment_assignment_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignment" ADD CONSTRAINT "equipment_assignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
