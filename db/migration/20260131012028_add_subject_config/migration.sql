/*
  Warnings:

  - Added the required column `subjectConfigId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "subjectConfigId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SubjectConfig" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "major" "Major"[],
    "grade" "Grade"[],

    CONSTRAINT "SubjectConfig_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_subjectConfigId_fkey" FOREIGN KEY ("subjectConfigId") REFERENCES "SubjectConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
