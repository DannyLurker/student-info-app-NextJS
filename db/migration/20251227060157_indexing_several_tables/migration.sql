/*
  Warnings:

  - A unique constraint covering the columns `[studentId,date]` on the table `StudentAttendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,subjectName,academicYear,semester]` on the table `SubjectMark` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Mark_subjectMarkId_idx" ON "Mark"("subjectMarkId");

-- CreateIndex
CREATE INDEX "MarkDescription_id_idx" ON "MarkDescription"("id");

-- CreateIndex
CREATE INDEX "ProblemPoint_studentId_idx" ON "ProblemPoint"("studentId");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "StudentAttendance_studentId_idx" ON "StudentAttendance"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_studentId_date_key" ON "StudentAttendance"("studentId", "date");

-- CreateIndex
CREATE INDEX "SubjectMark_studentId_idx" ON "SubjectMark"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectMark_studentId_subjectName_academicYear_semester_key" ON "SubjectMark"("studentId", "subjectName", "academicYear", "semester");

-- CreateIndex
CREATE INDEX "Teacher_email_idx" ON "Teacher"("email");

-- CreateIndex
CREATE INDEX "TeachingAssignment_teacherId_idx" ON "TeachingAssignment"("teacherId");
