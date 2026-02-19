/*
  Warnings:

  - A unique constraint covering the columns `[id,assignmentId,createdAt]` on the table `Assessment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `title` on table `Assessment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Assessment" ALTER COLUMN "title" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_id_assignmentId_createdAt_key" ON "Assessment"("id", "assignmentId", "createdAt");
