import { cache } from "react";
import { prisma } from "@/db/prisma";
import { auth } from "@/lib/auth/authNode";
import {
  hasManagementAccess,
  isClassSecretaryRole,
  isParentRole,
  isStudentRole,
  isTeacherRole,
} from "@/lib/constants/roles";
import { forbidden, notFound, unauthorized } from "@/lib/errors";
import { findStudentById } from "@/repositories/user-repository";
import {
  createTeacherSelect,
  createTeacherWhereUnique,
  findTeacher,
} from "@/features/teacher/server/repository/teacher-repositories";
import { Prisma } from "@prisma/client";

export const validateLoginSession = cache(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!user) {
    throw notFound("User not found");
  }

  return user;
});

export type LoginSesssion = Awaited<ReturnType<typeof validateLoginSession>>;

export const validateManagementSession = cache(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const teacherProfile = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    select: {
      userId: true,
      staffRole: true,
      user: {
        select: { name: true },
      },
    },
  });

  if (!teacherProfile) {
    throw notFound("Staff profile not found");
  }

  const canAccess = hasManagementAccess(teacherProfile.staffRole);

  if (!canAccess) {
    throw forbidden("You're not allowed to access this");
  }

  return teacherProfile;
});

export type ManagementSession = Awaited<
  ReturnType<typeof validateManagementSession>
>;

export const validateHomeroomTeacherSession = cache(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const teacherById = createTeacherWhereUnique({ id: session.user.id });

  const selectTeacherData = createTeacherSelect({
    userId: true,
    staffRole: true,
    user: {
      select: {
        name: true,
      },
    },
    homeroom: true,
  });

  const teacherProfile = await findTeacher(
    teacherById,
    selectTeacherData,
    prisma,
  );

  if (!teacherProfile) {
    throw notFound("Homeroom teacher profile not found");
  }

  const canAccess = isTeacherRole(teacherProfile.staffRole);

  const isHomeroomTeacher = !!teacherProfile.homeroom;

  if (!canAccess || !isHomeroomTeacher) {
    throw forbidden("You're not allowed to access this");
  }

  return teacherProfile;
});

export type HomeroomTeacherSession = Awaited<
  ReturnType<typeof validateHomeroomTeacherSession>
>;

export const validateTeacherSession = cache(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const teacherProfile = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    select: {
      userId: true,
      staffRole: true,
      user: {
        select: { name: true },
      },
    },
  });

  if (!teacherProfile) {
    throw notFound("Teacher profile not found");
  }

  const canAccess = isTeacherRole(teacherProfile.staffRole);

  if (!canAccess) {
    throw forbidden("You're not allowed to access this");
  }

  return teacherProfile;
});

export type TeacherSession = Awaited<ReturnType<typeof validateTeacherSession>>;

export const validateSecretarySession = cache(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const studentProfile = await findStudentById(session.user.id, prisma);

  if (!studentProfile) {
    throw notFound("Student secretary profile not found");
  }

  const canAccess = isClassSecretaryRole(studentProfile.studentRole);

  if (!canAccess) {
    throw forbidden("You're not allowed to access this");
  }

  return studentProfile;
});

export type ClassSecretarySession = Awaited<
  ReturnType<typeof validateSecretarySession>
>;

export const validateStudentSession = cache(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const studentProfile = await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: {
      userId: true,
      studentRole: true,
      classId: true,
      class: true,
      user: {
        select: { name: true },
      },
    },
  });

  if (!studentProfile) {
    throw notFound("Student profile not found");
  }

  const canAccess = isStudentRole(studentProfile.studentRole);

  if (!canAccess) {
    throw forbidden("You're not allowed to access this");
  }

  return studentProfile;
});

export type StudentSession = Awaited<ReturnType<typeof validateStudentSession>>;

export const validateParentSession = cache(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const parentProfile = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    select: {
      userId: true,
      studentId: true,
      user: {
        select: {
          role: true,
        },
      },
      student: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
          class: {
            select: {
              grade: true,
              major: true,
              section: true,
            },
          },
        },
      },
    },
  });

  if (!parentProfile) {
    throw notFound("Parent profile not found");
  }

  const canAccess = isParentRole(parentProfile.user.role);

  if (!canAccess) {
    throw forbidden("You're not allowed to access this");
  }

  return parentProfile;
});

export type ParentSession = Awaited<ReturnType<typeof validateParentSession>>;
