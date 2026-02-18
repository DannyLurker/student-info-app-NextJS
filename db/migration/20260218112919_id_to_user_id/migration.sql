-- DropForeignKey
ALTER TABLE "AssessmentScore" DROP CONSTRAINT "AssessmentScore_teacherId_fkey";

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
