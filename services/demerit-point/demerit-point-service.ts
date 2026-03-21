import { prisma } from "@/db/prisma";
import { assertDateIsInCurrentSemester } from "@/domain/date/date-rules";
import {
  isSinglePerDayCategory,
  validateDailyDemeritLimit,
} from "@/domain/demerit-point/demerit-point-rules";
import { demeritCheckSelect } from "@/domain/types/demerit-types";
import { TeacherSession } from "@/domain/types/sessions";
import { ValidInfractionType } from "@/lib/constants/discplinary";
import { notFound } from "@/lib/errors";
import { CreateDemeritPointSchema } from "@/lib/zod/demerit-point";
import { findUsersByIds } from "@/repositories/userRepository";
import { Prisma } from "@prisma/client";

export async function createDemeritPoint(
  data: CreateDemeritPointSchema,
  teacherSession: TeacherSession,
) {
  const demeritPointDate = new Date(data.date);

  assertDateIsInCurrentSemester(demeritPointDate);

  // Just in case, If we can validate through frontend, we dont have to revalidate it again in backend
  const uniqueStudentIds = [...new Set(data.studentsId)] as string[];

  const students = await findUsersByIds(
    uniqueStudentIds,
    demeritCheckSelect,
    prisma,
  );

  const demeritPointsToCreate: Prisma.DemeritPointCreateManyInput[] = [];

  if (students.length === 0) {
    throw notFound("No student data found");
  }

  for (const student of students) {
    if (isSinglePerDayCategory(data.demeritCategory)) {
      validateDailyDemeritLimit(student);
    }

    demeritPointsToCreate.push({
      studentId: student.id,
      category: data.demeritCategory as ValidInfractionType,
      points: data.points,
      date: new Date(data.date).toISOString(),
      description: data.description,
      recordedById: teacherSession.userId,
    });
  }

  await prisma.demeritPoint.createMany({
    data: demeritPointsToCreate,
  });
}
