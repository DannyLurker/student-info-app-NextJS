import { badRequest, handleError, notFound } from "@/lib/errors";
import { prisma } from "@/prisma/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const teacherIdParam = searchParams.get("teacherId");

    if (!teacherIdParam) {
      throw badRequest("Teacher id is missing.");
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherIdParam },
      select: {
        teachingAssignments: {
          select: {
            grade: true,
            major: true,
            classNumber: true,
            subject: {
              select: {
                subjectName: true,
              },
            },
          },
        },
        teachingClasses: true,
      },
    });

    if (!existingTeacher) {
      throw notFound("Teacher not found.");
    }

    return Response.json(
      {
        message:
          "Successfully retrieved teacher's teaching classes and asignments data",
        data: {
          teachingClasses: existingTeacher.teachingClasses,
          teachingAssignments: existingTeacher.teachingAssignments,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error in teaching-assignments-classes-and-assignments: ${error}`
    );
    return handleError(error);
  }
}
