-- AddForeignKey
ALTER TABLE "SubjectMark" ADD CONSTRAINT "SubjectMark_subjectName_fkey" FOREIGN KEY ("subjectName") REFERENCES "Subject"("subjectName") ON DELETE RESTRICT ON UPDATE CASCADE;
