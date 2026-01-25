/*
  Warnings:

  - You are about to drop the column `number` on the `Mark` table. All the data in the column will be lost.
  - Added the required column `assessmentNumber` to the `Mark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mark" DROP COLUMN "number",
ADD COLUMN     "assessmentNumber" INTEGER NOT NULL,
ADD COLUMN     "score" INTEGER;
