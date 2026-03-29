import { Prisma } from "@prisma/client";

export const selectClassroomWithTeacher =
  Prisma.validator<Prisma.ClassroomDefaultArgs>()({
    // You must wrap the fields in 'select' here
    select: {
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
  });

// Now this will correctly extract the result type
export type ClassroomWithTeacher = Prisma.ClassroomGetPayload<
  typeof selectClassroomWithTeacher
>;
