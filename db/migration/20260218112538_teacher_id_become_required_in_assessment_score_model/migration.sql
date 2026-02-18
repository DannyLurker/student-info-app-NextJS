/*
  Warnings:

  - Made the column `teacherId` on table `AssessmentScore` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AssessmentScore" DROP CONSTRAINT "AssessmentScore_teacherId_fkey";

-- AlterTable
ALTER TABLE "AssessmentScore" ALTER COLUMN "teacherId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
