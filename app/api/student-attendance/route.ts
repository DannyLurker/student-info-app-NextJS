import { badRequest, forbidden, handleError, notFound } from "@/lib/errors";
import {
  StudentAttendanceSchema,
  zodStudentAttandance,
} from "@/lib/utils/zodSchema";
import { prisma } from "@/prisma/prisma";

// Valid attendance types that can be stored in the database
const VALID_ATTENDANCE_TYPES = ["alpha", "sick", "permission"] as const;
type ValidAttendanceType = (typeof VALID_ATTENDANCE_TYPES)[number];

/**
 * Validates and normalizes the attendance type.
 * "present" means no record should exist - this is handled separately.
 * Returns the normalized type or null if "present".
 */
function normalizeAttendanceType(type: string): ValidAttendanceType | null {
  const normalized = type.toLowerCase().trim();

  // "present" means the student is present - no attendance record needed
  if (normalized === "present") {
    return null;
  }

  if (!VALID_ATTENDANCE_TYPES.includes(normalized as ValidAttendanceType)) {
    throw badRequest(
      `Invalid attendance type: "${type}". Valid types are: ${VALID_ATTENDANCE_TYPES.join(", ")}, or "present".`
    );
  }

  return normalized as ValidAttendanceType;
}

/**
 * Determines the semester based on the date.
 * Semester 1: July - December
 * Semester 2: January - June
 */
function getSemester(date: Date): 1 | 2 {
  const month = date.getMonth() + 1;
  return month >= 7 && month <= 12 ? 1 : 2;
}

/**
 * Gets the valid date range for the current semester.
 */
function getSemesterDateRange(referenceDate: Date): { start: Date; end: Date } {
  const year = referenceDate.getFullYear();
  const semester = getSemester(referenceDate);

  if (semester === 2) {
    // Semester 2: January 1 - June 30
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 5, 30, 23, 59, 59, 999),
    };
  }

  // Semester 1: July 1 - December 31
  return {
    start: new Date(year, 6, 1),
    end: new Date(year, 11, 31, 23, 59, 59, 999),
  };
}

/**
 * Gets the start and end of a specific day for date range queries.
 */
function getDayBounds(date: Date): { startOfDay: Date; endOfDay: Date } {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

export async function POST(req: Request) {
  try {
    const body: StudentAttendanceSchema = await req.json();
    const data = zodStudentAttandance.parse(body);

    console.log(data);

    // Parse and normalize the attendance date
    const attendanceDate = new Date(data.date);
    attendanceDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ============================================
    // VALIDATION 1: Future date check
    // ============================================
    if (attendanceDate > today) {
      throw badRequest("Attendance date cannot be in the future.");
    }

    // ============================================
    // VALIDATION 2: Semester/Academic year check
    // The attendance date must be within the CURRENT semester
    // ============================================
    const { start: semesterStart, end: semesterEnd } =
      getSemesterDateRange(today);

    if (attendanceDate < semesterStart || attendanceDate > semesterEnd) {
      const semesterNum = getSemester(today);
      throw badRequest(
        `Attendance date is outside the current semester (Semester ${semesterNum}). ` +
          `Allowed range: ${semesterStart.toISOString().split("T")[0]} to ${semesterEnd.toISOString().split("T")[0]}.`
      );
    }

    // ============================================
    // VALIDATION 3: Secretary role check
    // ============================================
    const secretary = await prisma.student.findUnique({
      where: { id: data.secretaryId },
      select: { role: true },
    });

    if (!secretary) {
      throw notFound("Secretary not found.");
    }

    if (secretary.role !== "classSecretary") {
      throw forbidden("Only class secretaries can record attendance.");
    }

    // ============================================
    // VALIDATION 4: Student exists check
    // ============================================
    const studentExists = await prisma.student.findUnique({
      where: { id: data.studentId },
      select: { id: true },
    });

    if (!studentExists) {
      throw notFound("Student not found.");
    }

    // ============================================
    // VALIDATION 5: Normalize and validate attendance type
    // ============================================
    const normalizedType = normalizeAttendanceType(data.attendanceType);

    // ============================================
    // LOOKUP: Find existing attendance for THIS student on THIS date
    // ============================================
    const { startOfDay, endOfDay } = getDayBounds(attendanceDate);

    const existingAttendance = await prisma.studentAttendance.findFirst({
      where: {
        studentId: data.studentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // ============================================
    // CASE A: "present" - delete existing record if any
    // (No record = present by default)
    // ============================================
    if (normalizedType === null) {
      if (existingAttendance) {
        await prisma.studentAttendance.delete({
          where: { id: existingAttendance.id },
        });
        return Response.json(
          { message: "Attendance record removed. Student marked as present." },
          { status: 200 }
        );
      }
      return Response.json(
        {
          message: "Student is already marked as present (no absence record).",
        },
        { status: 200 }
      );
    }

    // ============================================
    // CASE B: Non-present type - update or create record
    // ============================================
    const description =
      normalizedType === "alpha" ? "" : data.description || "";

    if (existingAttendance) {
      // UPDATE existing record for this date
      await prisma.studentAttendance.update({
        where: { id: existingAttendance.id },
        data: {
          type: normalizedType,
          description,
        },
      });

      return Response.json(
        { message: "Attendance record updated successfully." },
        { status: 200 }
      );
    }

    // CREATE new record for this date
    await prisma.studentAttendance.create({
      data: {
        studentId: data.studentId,
        type: normalizedType,
        description,
        date: attendanceDate,
      },
    });

    return Response.json(
      { message: "Attendance record created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const homeroomTeacherId = searchParams.get("homeroomTeacherId");
    const studentId = searchParams.get("studentId");

    if (!dateParam || !homeroomTeacherId) {
      throw badRequest(
        "Missing required parameters: date and homeroomTeacherId."
      );
    }

    // Validate studentId if provided (for secretary verification)
    if (studentId) {
      const secretary = await prisma.student.findUnique({
        where: { id: studentId },
        select: { role: true, homeroomTeacherId: true },
      });

      if (!secretary) {
        throw notFound("Student not found.");
      }

      if (secretary.role !== "classSecretary") {
        throw forbidden("Only class secretaries can view attendance records.");
      }

      if (secretary.homeroomTeacherId !== homeroomTeacherId) {
        throw forbidden("You can only view attendance for your own class.");
      }
    }

    const targetDate = new Date(dateParam);
    const { startOfDay, endOfDay } = getDayBounds(targetDate);

    const teacher = await prisma.teacher.findUnique({
      where: { id: homeroomTeacherId },
      include: { students: { select: { id: true } } },
    });

    if (!teacher) {
      throw notFound("Teacher not found.");
    }

    const studentIds = teacher.students.map((s) => s.id);

    const records = await prisma.studentAttendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return Response.json(
      {
        message: "Attendance retrieved successfully.",
        data: records,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return handleError(error);
  }
}
