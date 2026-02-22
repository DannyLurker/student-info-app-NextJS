import { prisma } from "@/db/prisma";
import { handleError, notFound } from "@/lib/errors";
import { validateStudentSession } from "@/lib/validation/guards";

export async function GET() {
  try {
    const studentSession = await validateStudentSession();

    const subjects = await prisma.subject.findMany({
      where: {
        config: {
          allowedGrades: {
            has: studentSession.class?.grade,
          },
          allowedMajors: {
            has: studentSession.class?.major,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (subjects.length === 0) throw notFound("Subject data not found");

    return Response.json(
      { message: "Successfully retrieved subject data", subjects },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(GET) /api/student/subject",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
