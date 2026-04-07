/*
  Warnings:

  - The primary key for the `Assessment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AssessmentScore` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Classroom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DemeritPoint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Gradebook` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Subject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SubjectConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TeachingAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "UserAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('USER', 'STUDENT', 'TEACHER', 'PARENT', 'CLASSROOM', 'GRADEBOOK', 'ASSESSMENT', 'ASSESSMENT_SCORE', 'SUBJECT', 'SUBJECT_CONFIG', 'TEACHING_ASSIGNMENT', 'DEMERIT_POINT');

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_gradebookId_fkey";

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_teachingAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentScore" DROP CONSTRAINT "AssessmentScore_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentScore" DROP CONSTRAINT "AssessmentScore_gradebookId_fkey";

-- DropForeignKey
ALTER TABLE "Gradebook" DROP CONSTRAINT "Gradebook_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_configId_fkey";

-- DropForeignKey
ALTER TABLE "TeachingAssignment" DROP CONSTRAINT "TeachingAssignment_classId_fkey";

-- DropForeignKey
ALTER TABLE "TeachingAssignment" DROP CONSTRAINT "TeachingAssignment_subjectId_fkey";

-- AlterTable
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "teachingAssignmentId" SET DATA TYPE TEXT,
ALTER COLUMN "gradebookId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Assessment_id_seq";

-- AlterTable
ALTER TABLE "AssessmentScore" DROP CONSTRAINT "AssessmentScore_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "gradebookId" SET DATA TYPE TEXT,
ALTER COLUMN "assessmentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "AssessmentScore_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AssessmentScore_id_seq";

-- AlterTable
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Attendance_id_seq";

-- AlterTable
ALTER TABLE "Classroom" DROP CONSTRAINT "Classroom_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Classroom_id_seq";

-- AlterTable
ALTER TABLE "DemeritPoint" DROP CONSTRAINT "DemeritPoint_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "DemeritPoint_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DemeritPoint_id_seq";

-- AlterTable
ALTER TABLE "Gradebook" DROP CONSTRAINT "Gradebook_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "subjectId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Gradebook_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Gradebook_id_seq";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "classId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "configId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Subject_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Subject_id_seq";

-- AlterTable
ALTER TABLE "SubjectConfig" DROP CONSTRAINT "SubjectConfig_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SubjectConfig_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SubjectConfig_id_seq";

-- AlterTable
ALTER TABLE "TeachingAssignment" DROP CONSTRAINT "TeachingAssignment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "subjectId" SET DATA TYPE TEXT,
ALTER COLUMN "classId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TeachingAssignment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TeachingAssignment_id_seq";

-- CreateTable
CREATE TABLE "LogAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "UserAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Student_classId_idx" ON "Student"("classId");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_configId_fkey" FOREIGN KEY ("configId") REFERENCES "SubjectConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gradebook" ADD CONSTRAINT "Gradebook_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_teachingAssignmentId_fkey" FOREIGN KEY ("teachingAssignmentId") REFERENCES "TeachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_gradebookId_fkey" FOREIGN KEY ("gradebookId") REFERENCES "Gradebook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_gradebookId_fkey" FOREIGN KEY ("gradebookId") REFERENCES "Gradebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAudit" ADD CONSTRAINT "LogAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
