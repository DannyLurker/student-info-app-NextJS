import { prisma } from "@/db/prisma";
import { TeacherFetchType } from "@/lib/constants/teacher";
import { badRequest } from "@/lib/errors";
import { findTeachers } from "@/repositories/user-repository";
import { Prisma } from "@prisma/client";

export const getTeachers = async (teacherFetchType: TeacherFetchType) => {
  const teacherWhereCondition: Prisma.TeacherWhereInput = {
    staffRole: "TEACHER",
  };

  const teacherSelect = Prisma.validator<Prisma.TeacherSelect>()({
    homeroom: {
      select: { id: true },
    },
    user: {
      select: {
        name: true,
        id: true,
        email: true,
      },
    },
  });

  if ((teacherFetchType as TeacherFetchType) === "nonHomeroom") {
    teacherWhereCondition.homeroom = null;
  }

  const teachers = await findTeachers(
    teacherWhereCondition,
    teacherSelect,
    prisma,
  );

  return teachers;
};

export const deleteTeacher = async (id: string) => {
  if (!id) {
    throw badRequest("User id is missing");
  }

  await prisma.user.delete({ where: { id } });
};
