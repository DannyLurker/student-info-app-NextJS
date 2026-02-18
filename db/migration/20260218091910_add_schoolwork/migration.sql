/*
  Warnings:

  - You are about to drop the column `assessmentmentNumber` on the `AssessmentScore` table. All the data in the column will be lost.
  - Added the required column `sequence` to the `AssessmentScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AssessmentType" ADD VALUE 'SCHOOLWORK';

-- AlterTable
ALTER TABLE "AssessmentScore" DROP COLUMN "assessmentmentNumber",
ADD COLUMN     "sequence" INTEGER NOT NULL;
