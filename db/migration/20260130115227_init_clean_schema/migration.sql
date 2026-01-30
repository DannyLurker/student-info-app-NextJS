-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('TEACHER', 'VICE_PRINCIPAL', 'PRINCIPAL');

-- CreateEnum
CREATE TYPE "StudentRole" AS ENUM ('STUDENT', 'CLASS_SECRETARY');

-- CreateEnum
CREATE TYPE "Outsider" AS ENUM ('PARENT');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('TENTH', 'ELEVENTH', 'TWELFTH');

-- CreateEnum
CREATE TYPE "Major" AS ENUM ('ACCOUNTING', 'SOFTWARE_ENGINEERING');

-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('FIRST', 'SECOND');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('SCHOOLWORK', 'HOMEWORK', 'QUIZ', 'EXAM', 'PROJECT', 'GROUP');

-- CreateEnum
CREATE TYPE "ProblemPointCategory" AS ENUM ('LATE', 'INCOMPLETE_ATTRIBUTES', 'DISCIPLINE', 'ACADEMIC', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('LATE', 'ALPHA', 'SICK', 'PERMISSION');

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL,
    "role" "StudentRole" NOT NULL DEFAULT 'STUDENT',
    "grade" "Grade" NOT NULL,
    "major" "Major" NOT NULL,
    "classNumber" TEXT NOT NULL,
    "homeroomClassId" INTEGER NOT NULL,
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpRequestCount" INTEGER NOT NULL DEFAULT 0,
    "otpResetAt" TIMESTAMP(3),
    "otpAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teacherId" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectMark" (
    "id" SERIAL NOT NULL,
    "subjectName" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mark" (
    "id" SERIAL NOT NULL,
    "subjectMarkId" INTEGER NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "score" INTEGER,
    "assessmentNumber" INTEGER NOT NULL,
    "descriptionId" INTEGER NOT NULL,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkDescription" (
    "id" SERIAL NOT NULL,
    "givenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "MarkDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAttendance" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "AttendanceType" NOT NULL,
    "description" TEXT,

    CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemPoint" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "point" INTEGER NOT NULL,
    "category" "ProblemPointCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "recordedBy" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "ProblemPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'TEACHER',
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpRequestCount" INTEGER NOT NULL DEFAULT 0,
    "otpResetAt" TIMESTAMP(3),
    "otpAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingClass" (
    "id" SERIAL NOT NULL,
    "grade" "Grade" NOT NULL,
    "major" "Major" NOT NULL,
    "classNumber" TEXT NOT NULL DEFAULT 'none',

    CONSTRAINT "TeachingClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeroomClass" (
    "id" SERIAL NOT NULL,
    "grade" "Grade" NOT NULL,
    "major" "Major" NOT NULL,
    "classNumber" TEXT NOT NULL DEFAULT 'none',
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "HomeroomClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingAssignment" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "grade" "Grade" NOT NULL,
    "major" "Major" NOT NULL,
    "classNumber" TEXT NOT NULL DEFAULT 'none',
    "totalAssignmentsAssigned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TeachingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Outsider" NOT NULL DEFAULT 'PARENT',
    "studentId" TEXT NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSession" (
    "sessionToken" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "TeacherSession" (
    "sessionToken" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "subjectName" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "_SubjectStudents" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SubjectStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TeacherToTeachingAssignment" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TeacherToTeachingAssignment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TeacherToTeachingClass" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TeacherToTeachingClass_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "SubjectMark_studentId_idx" ON "SubjectMark"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectMark_studentId_subjectName_academicYear_semester_key" ON "SubjectMark"("studentId", "subjectName", "academicYear", "semester");

-- CreateIndex
CREATE INDEX "Mark_subjectMarkId_idx" ON "Mark"("subjectMarkId");

-- CreateIndex
CREATE UNIQUE INDEX "Mark_subjectMarkId_assessmentNumber_key" ON "Mark"("subjectMarkId", "assessmentNumber");

-- CreateIndex
CREATE INDEX "StudentAttendance_studentId_idx" ON "StudentAttendance"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_studentId_date_key" ON "StudentAttendance"("studentId", "date");

-- CreateIndex
CREATE INDEX "ProblemPoint_studentId_idx" ON "ProblemPoint"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE INDEX "Teacher_email_idx" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingClass_grade_major_classNumber_key" ON "TeachingClass"("grade", "major", "classNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HomeroomClass_teacherId_key" ON "HomeroomClass"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeroomClass_grade_major_classNumber_key" ON "HomeroomClass"("grade", "major", "classNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TeachingAssignment_subjectId_grade_major_classNumber_key" ON "TeachingAssignment"("subjectId", "grade", "major", "classNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_studentId_key" ON "Parent"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSession_sessionToken_key" ON "StudentSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSession_sessionToken_key" ON "TeacherSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subjectName_key" ON "Subject"("subjectName");

-- CreateIndex
CREATE INDEX "_SubjectStudents_B_index" ON "_SubjectStudents"("B");

-- CreateIndex
CREATE INDEX "_TeacherToTeachingAssignment_B_index" ON "_TeacherToTeachingAssignment"("B");

-- CreateIndex
CREATE INDEX "_TeacherToTeachingClass_B_index" ON "_TeacherToTeachingClass"("B");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_homeroomClassId_fkey" FOREIGN KEY ("homeroomClassId") REFERENCES "HomeroomClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectMark" ADD CONSTRAINT "SubjectMark_subjectName_fkey" FOREIGN KEY ("subjectName") REFERENCES "Subject"("subjectName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectMark" ADD CONSTRAINT "SubjectMark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_subjectMarkId_fkey" FOREIGN KEY ("subjectMarkId") REFERENCES "SubjectMark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "MarkDescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemPoint" ADD CONSTRAINT "ProblemPoint_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemPoint" ADD CONSTRAINT "ProblemPoint_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeroomClass" ADD CONSTRAINT "HomeroomClass_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSession" ADD CONSTRAINT "StudentSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSession" ADD CONSTRAINT "TeacherSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectStudents" ADD CONSTRAINT "_SubjectStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectStudents" ADD CONSTRAINT "_SubjectStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeacherToTeachingAssignment" ADD CONSTRAINT "_TeacherToTeachingAssignment_A_fkey" FOREIGN KEY ("A") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeacherToTeachingAssignment" ADD CONSTRAINT "_TeacherToTeachingAssignment_B_fkey" FOREIGN KEY ("B") REFERENCES "TeachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeacherToTeachingClass" ADD CONSTRAINT "_TeacherToTeachingClass_A_fkey" FOREIGN KEY ("A") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeacherToTeachingClass" ADD CONSTRAINT "_TeacherToTeachingClass_B_fkey" FOREIGN KEY ("B") REFERENCES "TeachingClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
