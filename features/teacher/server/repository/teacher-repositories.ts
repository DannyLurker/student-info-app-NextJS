import { Prisma, PrismaClient } from "@prisma/client";

export const createTeacherWhere = <T extends Prisma.TeacherWhereInput>(
  where: T,
): T => where;

export const createTeacherWhereUnique = <
  T extends Prisma.TeacherWhereUniqueInput,
>(
  where: T,
): T => where;

export const createTeacherSelect = <T extends Prisma.TeacherSelect>(
  select: T,
): T => select;

export const teacherUpdateOperation = async <
  T extends Prisma.TeacherUpdateInput,
>(
  where: Prisma.TeacherWhereUniqueInput,
  data: Prisma.Subset<T, Prisma.TeacherUpdateInput>,
  tx: Prisma.TransactionClient | PrismaClient,
) => {
  return tx.teacher.update({
    where,
    data,
  });
};

export const findTeacher = async <T extends Prisma.TeacherSelect>(
  where: Prisma.TeacherWhereUniqueInput,
  select: Prisma.Subset<T, Prisma.TeacherSelect>,
  tx: PrismaClient,
) => {
  return tx.teacher.findUnique({
    where,
    select,
  });
};

export async function findTeachers<T extends Prisma.TeacherSelect>(
  where: Prisma.TeacherWhereInput,
  select: Prisma.Subset<T, Prisma.TeacherSelect>,
  tx: PrismaClient | Prisma.TransactionClient,
) {
  const result = tx.teacher.findMany({
    where: where,
    select: select,
  });

  return result as unknown as Prisma.TeacherGetPayload<{ select: T }>[];
}
