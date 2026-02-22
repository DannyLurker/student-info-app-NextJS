import { handleError } from "@/lib/errors";
import { prisma } from "@/db/prisma";
import { validateParentSession } from "@/lib/validation/guards";

export async function GET() {
  try {
    const parentSession = await validateParentSession();

    const attendanceStats = await prisma.attendance.findMany({
      where: { studentId: parentSession.studentId },
      select: {
        date: true,
        type: true,
      },
    });

    const problemPointRecords = await prisma.demeritPoint.findMany({
      where: { studentId: parentSession.studentId },
      select: {
        description: true,
        category: true,
        points: true,
        date: true,
      },
    });

    const totalStudentSubjects = await prisma.subject.count({
      where: {
        config: {
          allowedGrades: {
            has: parentSession.student.class?.grade,
          },
          allowedMajors: {
            has: parentSession.student.class?.major,
          },
        },
      },
    });

    return Response.json(
      {
        mesasge: "Successfully retrieved student attendance stats for parents",
        data: {
          studentName: parentSession.student.user.name,
          student: {
            id: parentSession.studentId,
            grade: parentSession.student.class?.grade,
            major: parentSession.student.class?.major,
            section: parentSession.student.class?.section,
          },
          studentSubjects: totalStudentSubjects,
          attendanceStats,
          problemPointRecords,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(GET) /api/parent",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
