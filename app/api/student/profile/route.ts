import { handleError } from "@/lib/errors";
import { prisma } from "@/db/prisma";
import { validateStudentSession } from "@/lib/validation/guards";

export async function GET() {
  try {
    const studentSession = await validateStudentSession();

    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: studentSession.userId },
      select: {
        date: true,
        type: true,
      },
    });

    const problemPointRecords = await prisma.demeritPoint.findMany({
      where: { studentId: studentSession.userId },
      select: {
        description: true,
        category: true,
        points: true,
        date: true,
      },
    });

    const subjects = await prisma.gradebook.count({
      where: { studentId: studentSession.userId },
    });

    return Response.json(
      {
        mesasge: "Successfully retrieved student attendance stats",
        data: {
          attendanceRecords,
          problemPointRecords,
          totalSubject: subjects,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(GET) /api/student/profile",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
