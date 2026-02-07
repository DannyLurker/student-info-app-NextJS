/*
  Warnings:

  - You are about to drop the `ProblemPoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProblemPoint" DROP CONSTRAINT "ProblemPoint_recordedBy_fkey";

-- DropForeignKey
ALTER TABLE "ProblemPoint" DROP CONSTRAINT "ProblemPoint_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentSession" DROP CONSTRAINT "StudentSession_studentId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherSession" DROP CONSTRAINT "TeacherSession_teacherId_fkey";

-- DropTable
DROP TABLE "ProblemPoint";

-- DropTable
DROP TABLE "StudentSession";

-- DropTable
DROP TABLE "TeacherSession";

-- CreateTable
CREATE TABLE "DisciplinaryPoint" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "point" INTEGER NOT NULL,
    "category" "ProblemPointCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "recordedBy" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "DisciplinaryPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL,
    "studentId" TEXT,
    "teacherId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT,
    "teacherId" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DisciplinaryPoint_studentId_idx" ON "DisciplinaryPoint"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "DisciplinaryPoint" ADD CONSTRAINT "DisciplinaryPoint_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryPoint" ADD CONSTRAINT "DisciplinaryPoint_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
