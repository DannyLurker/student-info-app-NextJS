import { TeacherUpdateSchema } from "@/lib/zod/teacher";
import { Prisma } from "@prisma/client";

type TeacherWithRelations = Prisma.TeacherGetPayload<{
  select: {
    user: {
      select: {
        name: true;
        email: true;
        password: true;
      };
    };
    assignments: {
      select: {
        id: true;
        class: true;
        subjectId: true;
      };
    };
  };
}>;

export const checkIsTeacherDataDirty = (
  current: TeacherWithRelations,
  incoming: TeacherUpdateSchema,
) => {
  const isNameDirty = current.user.name !== incoming.name;
  const isEmailDirty = current.user.email !== incoming.email;

  const isAssignmentsDirty =
    current.assignments.length !== incoming.teachingAssignments.length ||
    current.assignments.some((serverAssignment) => {
      const client = incoming.teachingAssignments.find(
        (assignment) => assignment.teachingAssignmentId === serverAssignment.id,
      );
      if (!client) return true; // Length mismatch or missing

      return (
        serverAssignment.class.grade !== client.grade ||
        serverAssignment.class.major !== client.major ||
        serverAssignment.class.section !== client.section ||
        serverAssignment.subjectId !== client.subjectId
      );
    });

  return isNameDirty || isEmailDirty || isAssignmentsDirty;
};
