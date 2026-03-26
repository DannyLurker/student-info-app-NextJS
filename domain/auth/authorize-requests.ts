import { forbidden } from "@/lib/errors";
import { ClassSecretarySession, HomeroomTeacherSession } from "./role-guards";

export function assertClassManagementAccess(
  secretarySession: ClassSecretarySession | null,
  homeroomTeacherSession: HomeroomTeacherSession | null,
): void {
  if (!secretarySession && !homeroomTeacherSession) {
    throw forbidden("You're not allowed to access this");
  }
}
