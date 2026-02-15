-- DropForeignKey
ALTER TABLE "Classroom" DROP CONSTRAINT "Classroom_homeroomTeacherId_fkey";

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "Teacher"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
