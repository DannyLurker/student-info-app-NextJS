/*
  Warnings:

  - You are about to drop the column `teacherAssignmentId` on the `Assessment` table. All the data in the column will be lost.
  - Added the required column `teachingAssignmentId` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_teacherAssignmentId_fkey";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "teacherAssignmentId",
ADD COLUMN     "teachingAssignmentId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_teachingAssignmentId_fkey" FOREIGN KEY ("teachingAssignmentId") REFERENCES "TeachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
