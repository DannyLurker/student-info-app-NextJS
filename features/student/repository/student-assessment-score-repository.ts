import { OFFSET, TAKE_RECORDS } from "@/lib/constants/pagination";
import { Prisma, PrismaClient } from "@prisma/client";

export const createAssessmentScoreWhere = <
  T extends Prisma.AssessmentScoreWhereInput,
>(
  where: T,
): T => where;

export const createAssessmentScoreWhereUnique = <
  T extends Prisma.AssessmentScoreWhereUniqueInput,
>(
  where: T,
): T => where;

export const createAssessmentScoreSelect = <
  T extends Prisma.AssessmentScoreSelect,
>(
  select: T,
): T => select;

export const findAsessmentScores = async <
  T extends Prisma.AssessmentScoreSelect,
>(
  whereQuery: Prisma.AssessmentScoreWhereInput,
  selectData: Prisma.Subset<T, Prisma.AssessmentScoreSelect>,
  page: number,
  tx: PrismaClient | Prisma.TransactionClient,
) => {
  return tx.assessmentScore.findMany({
    where: whereQuery,
    select: selectData,
    skip: page * OFFSET,
    take: TAKE_RECORDS,
    orderBy: {
      assessment: {
        createdAt: "asc",
      },
    },
  });
};

export const countAssessmentScore = async (
  whereQuery: Prisma.AssessmentScoreWhereInput,
  tx: PrismaClient | Prisma.TransactionClient,
) => {
  return tx.assessmentScore.count({
    where: whereQuery,
  });
};
