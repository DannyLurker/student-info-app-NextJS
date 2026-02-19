/*
  Warnings:

  - You are about to drop the column `academicYear` on the `Gradebook` table. All the data in the column will be lost.
  - You are about to drop the column `academicYear` on the `TeachingAssignment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,subjectId,semester]` on the table `Gradebook` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId,subjectId,classId]` on the table `TeachingAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Gradebook_studentId_subjectId_semester_academicYear_key";

-- DropIndex
DROP INDEX "TeachingAssignment_teacherId_subjectId_classId_academicYear_key";

-- AlterTable
ALTER TABLE "Gradebook" DROP COLUMN "academicYear";

-- AlterTable
ALTER TABLE "TeachingAssignment" DROP COLUMN "academicYear";

-- CreateIndex
CREATE UNIQUE INDEX "Gradebook_studentId_subjectId_semester_key" ON "Gradebook"("studentId", "subjectId", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingAssignment_teacherId_subjectId_classId_key" ON "TeachingAssignment"("teacherId", "subjectId", "classId");
