import { OFFSET, TAKE_RECORDS } from "@/lib/constants/pagination";
import { Prisma, PrismaClient } from "@prisma/client";

export const createStudentWhere = <T extends Prisma.StudentWhereInput>(
  where: T,
): T => where;

export const createStudentWhereUnique = <
  T extends Prisma.StudentWhereUniqueInput,
>(
  where: T,
): T => where;

export const createStudentSelect = <T extends Prisma.StudentSelect>(
  select: T,
): T => select;

export async function findStudentById(userIdParam: string, tx: PrismaClient) {
  return tx.student.findUnique({
    where: {
      userId: userIdParam,
    },
    select: {
      userId: true,
      studentRole: true,
      classId: true,
      class: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });
}

export const findStudents = async <T extends Prisma.StudentSelect>(
  where: Prisma.StudentWhereInput,
  select: Prisma.Subset<T, Prisma.StudentSelect>,
  isPaginationActive: boolean,
  page: number,
  tx: PrismaClient | Prisma.TransactionClient,
) => {
  const result = tx.student.findMany({
    where: where,
    select: select,
    skip: isPaginationActive ? page * OFFSET : undefined,
    take: isPaginationActive ? TAKE_RECORDS : undefined,
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  return result as unknown as Prisma.StudentGetPayload<{ select: T }>[];
};

export async function findStudentProfilesByIds(
  userIds: string[],
  tx: PrismaClient,
) {
  return tx.student.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, classId: true },
  });
}

export const countStudent = async (
  where: Prisma.StudentWhereInput,
  tx: PrismaClient | Prisma.TransactionClient,
) => {
  return tx.student.count({
    where: where,
  });
};
