-- DropIndex
DROP INDEX "MarkDescription_id_idx";

-- AlterTable
ALTER TABLE "TeachingAssignment" ADD COLUMN     "totalAssignmentsAssigned" INTEGER NOT NULL DEFAULT 0;
