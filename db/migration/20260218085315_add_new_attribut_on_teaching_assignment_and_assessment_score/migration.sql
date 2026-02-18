/*
  Warnings:

  - Added the required column `assessmentmentNumber` to the `AssessmentScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssessmentScore" ADD COLUMN     "assessmentmentNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TeachingAssignment" ADD COLUMN     "totalAssignmentAssigned" INTEGER NOT NULL DEFAULT 0;
