import { badRequest, forbidden, handleError, notFound } from "@/lib/errors";
import {
  StudentAttendanceSchema,
  zodStudentAttandance,
} from "@/lib/utils/zodSchema";
import { prisma } from "@/prisma/prisma";

export async function POST(req: Request) {
  try {
    const body: StudentAttendanceSchema = await req.json();
    const data = zodStudentAttandance.parse(body);
    const attendanceDate = new Date(data.date);
    const today = new Date();

    attendanceDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const secretaryExist = await prisma.student.findUnique({
      where: { id: data.secretaryId },
      select: { role: true },
    });

    if (!secretaryExist) {
      throw notFound("Secretary not found");
    }

    if (secretaryExist.role !== "classSecretary") {
      throw forbidden("Only class secretaries can record attendance.");
    }

    const studentExists = await prisma.student.count({
      where: { id: data.studentId },
    });

    if (!studentExists) {
      throw notFound("Student not found");
    }

    // Each student has at most one attendance record per day.
    // If no record exists, the student is considered present.
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await prisma.studentAttendance.findFirst({
      where: {
        studentId: data.studentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingAttendance) {
      throw badRequest("Only one attendance record per day is allowed.");
    }

    if (attendanceDate > today) {
      throw badRequest("Attendance date cannot be in the future.");
    }

    function getSemester(date: Date): 1 | 2 {
      const month = date.getMonth() + 1; // getMonth() returns 0–11, so we add 1 for human-readable month numbers
      if (month >= 7 && month <= 12) {
        return 1;
      }

      return 2;
    }

    function getSemesterDateRange(year: number, semester: 1 | 2) {
      if (semester === 2) {
        // Semester 2 → January-June
        return {
          start: new Date(year, 0, 1), // Jan 1
          end: new Date(year, 5, 30), // Jun 30
        };
      }

      // Semester 1 → July–December
      return {
        start: new Date(year, 6, 1), // Jul 1
        end: new Date(year, 11, 31), // Dec 31
      };
    }

    const semester = getSemester(today);

    const { start, end } = getSemesterDateRange(
      new Date().getFullYear(),
      semester
    );

    if (attendanceDate < start || attendanceDate > end) {
      throw badRequest(
        "Attendance date is outside the allowed semester range."
      );
    }

    await prisma.studentAttendance.create({
      data: {
        studentId: data.studentId,
        type: data.attendanceType,
        description: data.attendanceType === "alpha" ? "" : data.description,
        date: attendanceDate,
      },
    });

    return Response.json(
      {
        message: "Attendance record created successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return handleError(error);
  }
}
