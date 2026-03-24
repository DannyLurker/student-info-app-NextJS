import { Prisma, PrismaClient } from "@prisma/client";

export const getTeachingAssignments = async <
  T extends Prisma.TeachingAssignmentSelect,
>(
  userId: string,
  selectData: Prisma.Subset<T, Prisma.TeachingAssignmentSelect>,
  tx: PrismaClient | Prisma.TransactionClient,
) => {
  const result = tx.teachingAssignment.findMany({
    where: {
      teacherId: userId,
    },
    select: selectData,
  });

  return result as unknown as Prisma.TeachingAssignmentGetPayload<{
    select: T;
  }>;
};
