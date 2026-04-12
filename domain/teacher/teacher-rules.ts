import { notFound } from "@/lib/errors";

export function ensureTeacherExists(teacher: unknown): asserts teacher {
  if (!teacher) {
    throw notFound("Teacher not found");
  }
}
