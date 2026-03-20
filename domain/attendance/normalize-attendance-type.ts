import {
  VALID_ATTENDANCE_TYPES,
  ValidAttendanceType,
} from "@/lib/constants/attendance";
import { badRequest } from "@/lib/errors";

/**
 * Validates and normalizes the attendance type.
 * "present" means no record should exist - returns null.
 */
export function normalizeAttendanceType(
  type: string,
): ValidAttendanceType | null {
  const normalized = type.toUpperCase().trim();

  if (normalized === "PRESENT") {
    return null;
  }

  if (!VALID_ATTENDANCE_TYPES.includes(normalized as ValidAttendanceType)) {
    throw badRequest(
      `Invalid attendance type: "${type}". Valid types are: ${VALID_ATTENDANCE_TYPES.join(", ")}, or "PRESENT".`,
    );
  }

  return normalized as ValidAttendanceType;
}
