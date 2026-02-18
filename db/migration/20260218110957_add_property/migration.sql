/*
  Warnings:

  - Added the required column `description` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueAt` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `givenAt` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "dueAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "givenAt" TIMESTAMP(3) NOT NULL;
