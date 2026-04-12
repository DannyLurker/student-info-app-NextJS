import { Classroom } from "@prisma/client";
import { badRequest, notFound } from "../../lib/errors";
import { ClassSchema } from "@/lib/zod/general";

/**
 * Ensures a classroom exists in the system.
 * * @param classroom - The result of a database lookup (null/undefined if not found)
 * @throws {NotFoundError} If the classroom object is undefined/null
 */
export function ensureClassroomExists(classroom: unknown) {
  if (!classroom) {
    throw notFound("Classroom not found");
  }
}
export function ensureHomeroomTeacherIsEmpty(
  classroom: Classroom,
  teacherId: string,
) {
  if (classroom.homeroomTeacherId === teacherId) return;

  if (
    classroom.homeroomTeacherId &&
    classroom.homeroomTeacherId !== teacherId
  ) {
    throw badRequest("This classroom already has a homeroom teacher");
  }
}

export const checkIsClassroomDirty = (
  current: Classroom,
  incoming: ClassSchema,
) => {
  const checks = [
    current.grade !== incoming.grade,
    current.major !== incoming.major,
    current.section !== incoming.section,
  ];

  return checks.some((condition) => condition === true);
};
