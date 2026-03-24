import { prisma } from "@/db/prisma";
import { TeacherFetchType } from "@/lib/constants/teacher";
import { getTeachingAssignments } from "@/repositories/teaching-assignment-repository";
import { findTeachers } from "@/repositories/userRepository";
import { Prisma } from "@prisma/client";

export const getTeacher = async (teacherFetchType: TeacherFetchType) => {
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

  return {
    teachers,
  };
};

export const getTeachingAssignment = async (teacherId: string) => {
  const selectData = Prisma.validator<Prisma.TeachingAssignmentSelect>()({
    classId: true,
    class: {
      select: {
        grade: true,
        major: true,
        section: true,
      },
    },
    subject: {
      select: {
        id: true,
        name: true,
      },
    },
  });

  const teachingAssignments = await getTeachingAssignments(
    teacherId,
    selectData,
    prisma,
  );

  return {
    teachingAssignments,
  };
};
