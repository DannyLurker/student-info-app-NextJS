/**
 * Parses "YYYY-MM-DD" string into a UTC Date at noon.
 * Storing at noon (12:00 UTC) prevents timezone shifts (±12h) from
 * accidentally moving the date forward or backward when Prisma/DB converts to UTC.
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Use UTC noon so ±8h timezone offsets never cross a day boundary
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

/**
 * Determines the semester based on the date.
 */
export function getSemester(date: Date): 1 | 2 {
  const month = date.getUTCMonth() + 1;
  return month >= 7 && month <= 12 ? 1 : 2;
}

/**
 * Gets the valid date range for the current semester.
 */
export function getSemesterDateRange(referenceDate: Date): {
  start: Date;
  end: Date;
} {
  const year = referenceDate.getUTCFullYear();
  const semester = getSemester(referenceDate);
  if (semester === 2) {
    return {
      start: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
      end: new Date(Date.UTC(year, 5, 30, 23, 59, 59, 999)),
    };
  }
  return {
    start: new Date(Date.UTC(year, 6, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
  };
}

/**
 * Gets start and end of a day in UTC bounds.
 * Uses full UTC day range so queries work regardless of server timezone.
 */
export function getDayBounds(date: Date): { startOfDay: Date; endOfDay: Date } {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  return {
    startOfDay: new Date(Date.UTC(y, m, d, 0, 0, 0, 0)),
    endOfDay: new Date(Date.UTC(y, m, d, 23, 59, 59, 999)),
  };
}
