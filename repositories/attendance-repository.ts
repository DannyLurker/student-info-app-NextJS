import { PrismaClient } from "@prisma/client";

export function findAttendancesByIdsAndTodayDate(
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
