import { prisma } from "@/db/prisma";
import { Grade, Major } from "@/lib/constants/class";
import { OFFSET, TAKE_RECORDS } from "@/lib/constants/pagination";
import { SortOrder } from "@/lib/constants/sortingAndFilltering";
import { Prisma, PrismaClient } from "@prisma/client";

export async function findUniqueSubject<T extends Prisma.SubjectSelect>(
  whereQuery: Prisma.SubjectWhereUniqueInput,
  selectData: Prisma.Subset<T, Prisma.SubjectSelect>,
  tx: PrismaClient | Prisma.TransactionClient,
) {
  return tx.subject.findUnique({
    where: whereQuery,
    select: selectData,
  });
}

export async function findSubjects<T extends Prisma.SubjectSelect>(
  tx: PrismaClient | Prisma.TransactionClient,
  whereFilter: Prisma.SubjectWhereInput | {},
  selectData: Prisma.Subset<T, Prisma.SubjectSelect> | undefined,
  getAll: boolean,
  sortOrder?: SortOrder,
  page?: number,
) {
  const result = tx.subject.findMany({
    where: whereFilter,
    select: selectData,
    orderBy: {
      name: getAll ? sortOrder : undefined,
    },
    skip: getAll ? undefined : page ? page * OFFSET : undefined,
    take: getAll ? undefined : TAKE_RECORDS,
  });

  return result as unknown as Prisma.SubjectGetPayload<{
    select: T;
  }>[];
}

export async function findSubjectsForClass(
  grade: Grade,
  major: Major,
  tx: PrismaClient | Prisma.TransactionClient,
) {
  return tx.subject.findMany({
    where: {
      config: {
        allowedGrades: {
          has: grade,
        },
        allowedMajors: {
          has: major,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
}
