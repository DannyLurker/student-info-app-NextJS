/*
  Warnings:

  - You are about to drop the column `description` on the `AssessmentScore` table. All the data in the column will be lost.
  - You are about to drop the column `dueAt` on the `AssessmentScore` table. All the data in the column will be lost.
  - You are about to drop the column `giveAt` on the `AssessmentScore` table. All the data in the column will be lost.
  - You are about to drop the column `recordedById` on the `AssessmentScore` table. All the data in the column will be lost.
  - You are about to drop the column `sequence` on the `AssessmentScore` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `AssessmentScore` table. All the data in the column will be lost.
  - Added the required column `assessmentId` to the `AssessmentScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `AssessmentScore` table without a default value. This is not possible if the table is not empty.
  - Made the column `score` on table `AssessmentScore` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AssessmentScore" DROP CONSTRAINT "AssessmentScore_gradebookId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentScore" DROP CONSTRAINT "AssessmentScore_recordedById_fkey";

-- AlterTable
ALTER TABLE "AssessmentScore" DROP COLUMN "description",
DROP COLUMN "dueAt",
DROP COLUMN "giveAt",
DROP COLUMN "recordedById",
DROP COLUMN "sequence",
DROP COLUMN "type",
ADD COLUMN     "assessmentId" INTEGER NOT NULL,
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "teacherId" TEXT,
ALTER COLUMN "score" SET NOT NULL,
ALTER COLUMN "score" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Assessment" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "type" "AssessmentType" NOT NULL DEFAULT 'SCHOOLWORK',
    "assignmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TeachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_gradebookId_fkey" FOREIGN KEY ("gradebookId") REFERENCES "Gradebook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
