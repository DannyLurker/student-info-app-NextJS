import { prisma } from "@/db/prisma";
import { Grade, Major } from "@/lib/constants/class";
import { Prisma } from "@prisma/client";

export async function findSubjects<T extends Prisma.SubjectSelect>(
  whereFilter: Prisma.SubjectWhereInput | {},
  selectData: Prisma.Subset<T, Prisma.SubjectSelect>,
) {
  return prisma.subject.findMany({
    where: whereFilter,
    select: selectData,
  });
}

export async function findSubjectsForClass(grade: Grade, major: Major) {
  return prisma.subject.findMany({
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
