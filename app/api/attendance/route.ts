import { badRequest, forbidden, handleError } from "@/lib/errors";
import { prisma } from "@/db/prisma";
import {
  VALID_ATTENDANCE_TYPES,
  ValidAttendanceType,
} from "@/lib/constants/attendance";
import {
  bulkAttendanceSchema,
  studentAttendacesQueries,
} from "@/lib/utils/zodSchema";
import {
  getDayBounds,
  getSemester,
  getSemesterDateRange,
  parseDateString,
} from "@/lib/utils/date";
import {
  MIN_SEARCH_LENGTH,
  OFFSET,
  TAKE_RECORDS,
} from "@/lib/constants/pagination";
import {
  validateHomeroomTeacherSession,
  validateSecretarySession,
} from "@/lib/validation/guards";

/**
 * Validates and normalizes the attendance type.
 * "present" means no record should exist - returns null.
 */
function normalizeAttendanceType(type: string): ValidAttendanceType | null {
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

export async function POST(req: Request) {
  try {
    let secretarySession = null;
    let homeroomTeacherSession = null;

    try {
      secretarySession = await validateSecretarySession();
    } catch {}

    try {
      homeroomTeacherSession = await validateHomeroomTeacherSession();
    } catch {}

    if (!secretarySession && !homeroomTeacherSession) {
      throw forbidden("You're not allowed to access this");
    }

    const rawData = await req.json();
    const { date, records } = bulkAttendanceSchema.parse(rawData);

    console.log("Date: " + date);

    if (records.length === 0) {
      return Response.json(
        { message: "No records to process." },
        { status: 200 },
      );
    }

    // VALIDATION: Date logic
    const attendanceDate = parseDateString(date);

    const today = new Date();
    today.setHours(23, 59, 59, 59);

    if (attendanceDate > today) {
      throw badRequest("Attendance date cannot be in the future.");
    }

    const { start: semesterStart, end: semesterEnd } =
      getSemesterDateRange(today);
    if (attendanceDate < semesterStart || attendanceDate > semesterEnd) {
      const semesterNum = getSemester(today);
      throw badRequest(`Outside current semester (Semester ${semesterNum}).`);
    }

    // Pre-fetch available students & attendances data (Batching)
    const studentIds = records.map((r) => r.studentId);
    const { startOfDay, endOfDay } = getDayBounds(attendanceDate);

    const [existingStudents, existingAttendances] = await Promise.all([
      prisma.student.findMany({
        where: { userId: { in: studentIds } },
        select: { userId: true, classId: true },
      }),
      prisma.attendance.findMany({
        where: {
          studentId: { in: studentIds },
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    const studentMap = new Map(existingStudents.map((s: any) => [s.userId, s]));
    const attendanceMap = new Map(
      existingAttendances.map((a) => [a.studentId, a]),
    );

    const validationErrors: string[] = [];
    const normalizedRecords: Array<{
      studentId: string;
      type: ValidAttendanceType | null;
      description: string;
    }> = [];

    for (const record of records) {
      const student = studentMap.get(record.studentId);

      if (!student) {
        validationErrors.push(`Student ${record.studentId} not found.`);
        continue;
      }

      if (
        secretarySession &&
        student.classId !== secretarySession.classId &&
        homeroomTeacherSession &&
        student.classId !== homeroomTeacherSession.homeroom?.id
      ) {
        validationErrors.push(
          `Student ${record.studentId} is not in your class.`,
        );
        continue;
      }

      const normalizedType = normalizeAttendanceType(record.attendanceType);
      normalizedRecords.push({
        studentId: record.studentId,
        type: normalizedType,
        description:
          normalizedType === "ALPHA" || normalizedType === "LATE"
            ? ""
            : record.description || "",
      });
    }

    if (validationErrors.length > 0) {
      throw badRequest(`Validation failed: ${validationErrors.join("; ")}`);
    }

    const result = await prisma.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;
      let deleted = 0;

      for (const record of normalizedRecords) {
        const existing = attendanceMap.get(record.studentId);

        if (record.type === null) {
          // Present = if there is a record, Delete attendance record
          if (existing) {
            await tx.attendance.delete({ where: { id: existing.id } });
            deleted++;
          }
        } else if (existing) {
          await tx.attendance.update({
            where: { id: existing.id },
            data: {
              type: record.type as ValidAttendanceType,
              note: record.description,
            },
          });
          updated++;
        } else {
          await tx.attendance.create({
            data: {
              studentId: record.studentId,
              type: record.type as ValidAttendanceType,
              note: record.description,
              date: attendanceDate,
            },
          });
          created++;
        }
      }

      return { created, updated, deleted };
    });

    return Response.json({
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.error("API_ERROR", { route: "/api/attendance", error });
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    let secretarySession = null;
    let homeroomTeacherSession = null;

    try {
      secretarySession = await validateSecretarySession();
    } catch {}

    try {
      homeroomTeacherSession = await validateHomeroomTeacherSession();
    } catch {}

    if (!secretarySession && !homeroomTeacherSession) {
      throw forbidden("You're not allowed to access this");
    }

    const { searchParams } = new URL(req.url); // Use standard URL for search params

    const rawParams = Object.fromEntries(searchParams.entries());

    const data = studentAttendacesQueries.parse(rawParams);

    const targetDate = parseDateString(data.date);

    console.log("Target Date (GET): " + targetDate);

    const { startOfDay, endOfDay } = getDayBounds(targetDate);

    let studentAttendanceRecords;

    const selectData = {
      id: true,
      name: true,
      studentProfile: {
        select: {
          attendance: {
            where: {
              date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              date: true,
              type: true,
              note: true,
            },
          },
        },
      },
    };

    const classIdSession = secretarySession?.classId
      ? secretarySession.classId
      : homeroomTeacherSession?.homeroom?.id;

    if (data.searchQuery && data.searchQuery.length >= MIN_SEARCH_LENGTH) {
      studentAttendanceRecords = await prisma.user.findMany({
        where: {
          name: {
            contains: data.searchQuery,
            mode: "insensitive",
          },
          role: "STUDENT",
        },
        select: selectData,
        skip: data.page * OFFSET,
        take: TAKE_RECORDS,
        orderBy: {
          name: data.sortOrder === "asc" ? "asc" : "desc",
        },
      });
    } else if (data.sortBy === "name") {
      studentAttendanceRecords = await prisma.user.findMany({
        where: {
          studentProfile: {
            classId: classIdSession,
          },
        },
        select: selectData,
        skip: data.page * OFFSET,
        take: TAKE_RECORDS,
        orderBy: {
          name: data.sortOrder === "asc" ? "asc" : "desc",
        },
      });
    } else {
      studentAttendanceRecords = await prisma.user.findMany({
        where: {
          studentProfile: {
            classId: classIdSession,
          },
        },
        select: selectData,
        skip: data.page * OFFSET,
        take: TAKE_RECORDS,
      });
    }

    const totalStudents = await prisma.user.count({
      where: {
        studentProfile: {
          classId: classIdSession,
        },
      },
    });

    // Get attendance stats for the selected date
    const attendanceStats = await prisma.attendance.groupBy({
      by: ["type"],
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        student: {
          classId: classIdSession,
        },
      },
      _count: {
        type: true,
      },
    });

    // Transform stats into a more usable format
    const stats = {
      sick: 0,
      permission: 0,
      alpha: 0,
      late: 0,
    };

    for (const stat of attendanceStats) {
      if (stat.type === "SICK") stats.sick = stat._count.type;
      else if (stat.type === "PERMISSION") stats.permission = stat._count.type;
      else if (stat.type === "ALPHA") stats.alpha = stat._count.type;
      else if (stat.type === "LATE") stats.late = stat._count.type;
    }

    return Response.json(
      {
        message: "Attendance retrieved successfully.",
        data: { studentAttendanceRecords, totalStudents, stats },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/attendance",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
