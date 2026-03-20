import { badRequest } from "@/lib/errors";
import { getSemester, getSemesterDateRange } from "@/lib/utils/date";

const today = new Date();
today.setHours(23, 59, 59, 59);

/**
 * Ensures the attendance date is not set to a future date.
 * @throws {BadRequest} error if invalid.
 */
export function assertAttendanceDateIsNotInFuture(attendanceDate: Date) {
  if (attendanceDate > today) {
    throw badRequest("Attendance date cannot be in the future.");
  }
}

export function assertAttendanceDateIsInCurrentSemester(attendanceDate: Date) {
  const { start: semesterStart, end: semesterEnd } =
    getSemesterDateRange(today);
  if (attendanceDate < semesterStart || attendanceDate > semesterEnd) {
    const semesterNum = getSemester(today);
    throw badRequest(`Outside current semester (Semester ${semesterNum}).`);
  }
}
