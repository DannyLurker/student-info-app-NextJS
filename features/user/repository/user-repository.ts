import { OFFSET, TAKE_RECORDS } from "@/lib/constants/pagination";
import { SortOrder } from "@/lib/constants/sortingAndFilltering";
import { Prisma, PrismaClient } from "@prisma/client";

export const createUserWhere = <T extends Prisma.UserWhereInput>(where: T): T =>
  where;

export const createUserWhereUnique = <T extends Prisma.UserWhereUniqueInput>(
  where: T,
): T => where;

export const createUserSelect = <T extends Prisma.UserSelect>(select: T): T =>
  select;

export async function findUserByEmail(
  email: string,
  tx: PrismaClient | Prisma.TransactionClient,
) {
  return tx.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

export const deleteUserById = async (
  id: string,
  tx: PrismaClient | Prisma.TransactionClient,
) => {
  return tx.user.delete({
    where: { id },
  });
};

export async function findUsersByIds<T extends Prisma.UserSelect>(
  userIds: string[],
  // Use Prisma.Subset to ensure T only contains valid User keys
  select: Prisma.Subset<T, Prisma.UserSelect>,
  tx: Prisma.TransactionClient | PrismaClient,
) {
  if (userIds.length === 0) return [];

  const result = await tx.user.findMany({
    where: { id: { in: userIds } },
    select: select,
  });

  return result as unknown as Prisma.UserGetPayload<{ select: T }>[];
}
export async function findUsersByName<T extends Prisma.UserFindManyArgs>(
  name: string,
  classId: string,
  select: T["select"],
  tx: PrismaClient,
  page: number,
  sortOrder: SortOrder,
) {
  return tx.user.findMany({
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
      studentProfile: {
        classId: classId,
      },
      role: "STUDENT",
    },
    select,
    skip: page * OFFSET,
    take: TAKE_RECORDS,
    orderBy: {
      name: sortOrder === "asc" ? "asc" : "desc",
    },
  });
}

export async function findUsersByClassId<T extends Prisma.UserSelect>(
  classId: string,
  select: T,
  tx: PrismaClient,
  page: number,
  sortOrder: SortOrder,
) {
  return tx.user.findMany({
    where: {
      studentProfile: {
        classId: classId,
      },
    },
    select,
    skip: page * OFFSET,
    take: TAKE_RECORDS,
    orderBy: {
      name: sortOrder === "asc" ? "asc" : "desc",
    },
  });
}

export const updateSingleUser = async (
  where: Prisma.UserWhereUniqueInput,
  data: Prisma.UserUpdateInput,
  tx: Prisma.TransactionClient | PrismaClient,
) => {
  return tx.user.update({
    where,
    data,
  });
};
