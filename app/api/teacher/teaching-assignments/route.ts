import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/errors";
import { validateTeacherSession } from "@/lib/validation/guards";

export async function GET() {
  try {
    const teacherSession = await validateTeacherSession();

    const teachingAssignments = await prisma.teachingAssignment.findMany({
      where: {
        teacherId: teacherSession.userId,
      },
      select: {
        class: {
          select: {
            grade: true,
            major: true,
            section: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return Response.json(
      {
        message: "Successfully retrieved teaching assignments data",
        teachingAssignments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(GET) /api/teacher/teaching-assignment",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
