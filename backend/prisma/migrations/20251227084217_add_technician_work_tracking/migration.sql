-- CreateEnum
CREATE TYPE "HealthScore" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "RootCause" AS ENUM ('WEAR_AND_TEAR', 'ELECTRICAL_FAULT', 'MECHANICAL_FAILURE', 'OPERATOR_ERROR', 'EXTERNAL_DAMAGE', 'SOFTWARE_ISSUE', 'OTHER');

-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'ESCALATED';

-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "health_score" "HealthScore" DEFAULT 'GREEN',
ADD COLUMN     "is_unrepairable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scrap_notes" TEXT;

-- AlterTable
ALTER TABLE "maintenance_request" ADD COLUMN     "assigned_technician_id" UUID,
ADD COLUMN     "end_time" TIMESTAMP,
ADD COLUMN     "hours_spent" DOUBLE PRECISION,
ADD COLUMN     "is_temporary_fix" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "root_cause" "RootCause",
ADD COLUMN     "start_time" TIMESTAMP,
ADD COLUMN     "work_notes" TEXT;

-- AddForeignKey
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_assigned_technician_id_fkey" FOREIGN KEY ("assigned_technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
