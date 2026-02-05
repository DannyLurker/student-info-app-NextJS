/*
  Warnings:

  - A unique constraint covering the columns `[major,grade,subjectType]` on the table `SubjectConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SubjectConfig_major_grade_subjectType_key" ON "SubjectConfig"("major", "grade", "subjectType");
