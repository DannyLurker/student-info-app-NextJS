-- DropForeignKey
ALTER TABLE "AssessmentScore" DROP CONSTRAINT "AssessmentScore_recordedById_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "DemeritPoint" DROP CONSTRAINT "DemeritPoint_recordedById_fkey";

-- DropForeignKey
ALTER TABLE "DemeritPoint" DROP CONSTRAINT "DemeritPoint_studentId_fkey";

-- AddForeignKey
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemeritPoint" ADD CONSTRAINT "DemeritPoint_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemeritPoint" ADD CONSTRAINT "DemeritPoint_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
