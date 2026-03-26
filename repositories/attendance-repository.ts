import { Prisma, PrismaClient } from "@prisma/client";

export const createAttendanceWhere = <T extends Prisma.AttendanceWhereInput>(
  where: T,
): T => where;

export const createAttendanceWhereUnique = <
  T extends Prisma.AttendanceWhereUniqueInput,
>(
  where: T,
): T => where;

export const createAttendanceSelect = <T extends Prisma.AttendanceSelect>(
  select: T,
): T => select;

export function findAttendanceByIdsAndTodayDate(
  userIds: string[],
  startOfDay: Date,
  endOfDay: Date,
  tx: PrismaClient,
) {
  return tx.attendance.findMany({
    where: {
      studentId: { in: userIds },
      date: { gte: startOfDay, lte: endOfDay },
    },
  });
}

export function getAttendanceStatsByDate(
  classId: number,
  startOfDay: Date,
  endOfDay: Date,
  tx: PrismaClient,
) {
  return tx.attendance.groupBy({
    by: ["type"],
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      student: {
        classId: classId,
      },
    },
    _count: {
      type: true,
    },
  });
}

export function getAttendanceStatsByStudentIds(
  studentIds: string[],
  tx: PrismaClient,
) {
  return tx.attendance.groupBy({
    by: ["type", "studentId"],
    where: {
      studentId: {
        in: studentIds,
      },
    },
    _count: true,
  });
}

export const findAttendanceByStudentId = async <
  T extends Prisma.AttendanceSelect,
>(
  whereQuery: Prisma.AttendanceWhereInput,
  selectData: Prisma.Subset<T, Prisma.AttendanceSelect>,
  tx: PrismaClient | Prisma.TransactionClient,
) => {
  return tx.attendance.findMany({
    where: whereQuery,
    select: selectData,
  });
};
