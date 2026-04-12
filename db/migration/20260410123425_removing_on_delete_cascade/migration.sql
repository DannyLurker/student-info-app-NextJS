-- DropForeignKey
ALTER TABLE "TeachingAssignment" DROP CONSTRAINT "TeachingAssignment_teacherId_fkey";

-- AlterTable
ALTER TABLE "TeachingAssignment" ALTER COLUMN "teacherId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
