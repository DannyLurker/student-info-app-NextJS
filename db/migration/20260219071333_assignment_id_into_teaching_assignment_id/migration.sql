/*
  Warnings:

  - You are about to drop the column `assignmentId` on the `Assessment` table. All the data in the column will be lost.
  - Added the required column `teacherAssignmentId` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_assignmentId_fkey";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "assignmentId",
ADD COLUMN     "teacherAssignmentId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_teacherAssignmentId_fkey" FOREIGN KEY ("teacherAssignmentId") REFERENCES "TeachingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
