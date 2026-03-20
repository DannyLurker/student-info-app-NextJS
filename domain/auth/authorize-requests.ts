import { forbidden } from "@/lib/errors";
import { HomeroomTeacherSession, SecretarySession } from "../types/sessions";

export function assertClassManagementAccess(
  secretarySession: SecretarySession | null,
  homeroomTeacherSession: HomeroomTeacherSession | null,
): void {
  if (!secretarySession && !homeroomTeacherSession) {
    throw forbidden("You're not allowed to access this");
  }
}
