-- DropForeignKey
ALTER TABLE "Gradebook" DROP CONSTRAINT "Gradebook_subjectId_fkey";

-- AddForeignKey
ALTER TABLE "Gradebook" ADD CONSTRAINT "Gradebook_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
