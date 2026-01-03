import { badRequest, handleError, notFound } from "@/lib/errors";
import { prisma } from "@/prisma/prisma";

function getDayBounds(date: Date): { startOfDay: Date; endOfDay: Date } {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const teacherIdParam = searchParams.get("teacherId");
    const dateParam = searchParams.get("date");

    if (!teacherIdParam || !dateParam) {
      throw badRequest("Missing required field");
    }

    const targetDate = new Date(dateParam);
    const { startOfDay, endOfDay } = getDayBounds(targetDate);

    const existingTeacher = await prisma.homeroomClass.findUnique({
      where: { teacherId: teacherIdParam },
      select: {
        classNumber: true,
        grade: true,
        major: true,
      },
    });

    if (!existingTeacher) {
      return notFound("Teacher not found");
    }

    const findStudents = await prisma.student.findMany({
      where: {
        classNumber: existingTeacher.classNumber,
        grade: existingTeacher.grade,
        major: existingTeacher.major,
      },
      select: {
        id: true,
        name: true,
        attendances: {
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          select: {
            date: true,
            type: true,
            description: true,
          },
        },
      },
    });

    return Response.json(
      {
        message: "Succesfully retrieved homeroom class students data",
        data: {
          students: findStudents,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in homeroom-class-students-list: ${error}`);
    return handleError(error);
  }
}
