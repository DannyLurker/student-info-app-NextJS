/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AssessmentScore` table. All the data in the column will be lost.
  - Added the required column `dueAt` to the `AssessmentScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `giveAt` to the `AssessmentScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssessmentScore" DROP COLUMN "createdAt",
ADD COLUMN     "dueAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "giveAt" TIMESTAMP(3) NOT NULL;
