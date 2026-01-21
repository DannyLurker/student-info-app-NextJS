/*
  Warnings:

  - The values [absent] on the enum `AttendanceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceType_new" AS ENUM ('alpha', 'sick', 'permission');
ALTER TABLE "StudentAttendance" ALTER COLUMN "type" TYPE "AttendanceType_new" USING ("type"::text::"AttendanceType_new");
ALTER TYPE "AttendanceType" RENAME TO "AttendanceType_old";
ALTER TYPE "AttendanceType_new" RENAME TO "AttendanceType";
DROP TYPE "public"."AttendanceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "StudentAttendance" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;
