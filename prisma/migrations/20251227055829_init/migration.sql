-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('EMPLOYEE', 'TECHNICIAN', 'MANAGER');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('CORRECTIVE', 'PREVENTIVE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EquipmentEvent" AS ENUM ('CREATED', 'REPAIRED', 'SCRAPPED', 'TEAM_CHANGED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "team_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_team" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_profile" (
    "user_id" UUID NOT NULL,
    "skill_tags" TEXT[],
    "experience_years" INTEGER,
    "current_load" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "technician_profile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "serial_number" VARCHAR(100) NOT NULL,
    "location" VARCHAR(100),
    "department" VARCHAR(100),
    "primary_team_id" UUID,
    "purchase_date" DATE,
    "warranty_end" DATE,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_request" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150),
    "description" TEXT,
    "request_type" "RequestType" NOT NULL,
    "equipment_id" UUID,
    "team_id" UUID,
    "technical_id" UUID,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "scheduled_date" TIMESTAMP,
    "created_by" UUID,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP,

    CONSTRAINT "maintenance_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_history" (
    "id" UUID NOT NULL,
    "request_id" UUID,
    "assigned_to" UUID,
    "assigned_by" UUID,
    "assigned_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_log" (
    "id" UUID NOT NULL,
    "request_id" UUID,
    "technician_id" UUID,
    "hours_spent" DECIMAL(4,2),
    "root_cause" VARCHAR(150),
    "resolution_notes" TEXT,
    "logged_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_health" (
    "equipment_id" UUID NOT NULL,
    "health_score" INTEGER,
    "breakdown_count" INTEGER,
    "avg_repair_time" DECIMAL(4,2),
    "last_updated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_health_pkey" PRIMARY KEY ("equipment_id")
);

-- CreateTable
CREATE TABLE "equipment_history" (
    "id" UUID NOT NULL,
    "equipment_id" UUID,
    "event_type" "EquipmentEvent" NOT NULL,
    "event_note" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalation_log" (
    "id" UUID NOT NULL,
    "request_id" UUID,
    "reason" TEXT,
    "escalated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "escalation_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_serial_number_key" ON "equipment"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_key" ON "refresh_token"("token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "maintenance_team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "maintenance_team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_profile" ADD CONSTRAINT "technician_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_primary_team_id_fkey" FOREIGN KEY ("primary_team_id") REFERENCES "maintenance_team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "maintenance_team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_technical_id_fkey" FOREIGN KEY ("technical_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "maintenance_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_log" ADD CONSTRAINT "work_log_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "maintenance_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_log" ADD CONSTRAINT "work_log_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_health" ADD CONSTRAINT "equipment_health_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_history" ADD CONSTRAINT "equipment_history_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_log" ADD CONSTRAINT "escalation_log_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "maintenance_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
