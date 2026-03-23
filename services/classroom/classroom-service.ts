import { prisma } from "@/db/prisma";
import {
  compareClassAtributes,
  validateClassroomUniquenes,
} from "@/domain/classroom/classroom-validations";
import { badRequest } from "@/lib/errors";
import { CreateClassSchema, UpdateClassSchema } from "@/lib/zod/classroom";
import {
  findClassrooms,
  findUniqueClassroom,
} from "@/repositories/classroom-repository";
import { Prisma } from "@prisma/client";

export const getClassroom = async () => {
  const selectClassroomWithTeacher = Prisma.validator<Prisma.ClassroomSelect>()(
    {
      id: true,
      grade: true,
      major: true,
      section: true,
      homeroomTeacherId: true,
      homeroomTeacher: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  );

  const classroomData = await findClassrooms(
    {},
    selectClassroomWithTeacher,
    prisma,
  );

  return {
    classroomData,
  };
};

export const createClassroom = async (data: CreateClassSchema) => {
  // from DB
  const classroomData = await findClassrooms({}, undefined, prisma);

  const classroomSet = new Set(
    classroomData.map(
      (classroom) =>
        `${classroom.grade}-${classroom.major}-${classroom.section}`,
    ),
  );

  validateClassroomUniquenes(data, classroomSet);

  await prisma.classroom.createMany({
    data: data,
  });
};

export const updateClassroom = async (data: UpdateClassSchema) => {
  const classroomById = Prisma.validator<Prisma.ClassroomWhereUniqueInput>()({
    id: data.id,
  });

  const selectClassData = Prisma.validator<Prisma.ClassroomSelect>()({
    id: true,
    grade: true,
    major: true,
    section: true,
    homeroomTeacherId: true,
  });

  const currentClass = await findUniqueClassroom(
    classroomById,
    selectClassData,
    prisma,
  );

  if (!currentClass) {
    throw badRequest("Classroom not found");
  }

  const classroomByUniqueIdentifier =
    Prisma.validator<Prisma.ClassroomWhereUniqueInput>()({
      grade_major_section: {
        grade: data.classSchema.grade,
        major: data.classSchema.major,
        section: data.classSchema.section,
      },
    });

  const selectClassroomId = Prisma.validator<Prisma.ClassroomSelect>()({
    id: true,
  });

  const findDuplicate = await prisma.classroom.findUnique({
    where: classroomByUniqueIdentifier,
    select: selectClassroomId,
  });

  if (findDuplicate && findDuplicate.id !== data.id) {
    throw badRequest("A classroom with this config already exists");
  }

  const { hasChanged, changedData } = compareClassAtributes(currentClass, data);

  if (!hasChanged) {
    return Response.json({ message: "No data was edited" }, { status: 200 });
  }

  await prisma.classroom.update({
    where: {
      id: data.id,
    },
    data: changedData,
  });
};

export const deleteClassroom = async (classroomId: number) => {
  if (!classroomId || isNaN(classroomId)) throw badRequest("Invalid Class ID");

  if (!classroomId) {
    throw badRequest("Class ID is required");
  }

  await prisma.classroom.delete({
    where: {
      id: classroomId,
    },
  });
};
