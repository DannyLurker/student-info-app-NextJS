import { handleError } from "@/lib/errors";
import { prisma } from "@/db/prisma";
import { studentQuerySchema } from "@/lib/utils/zodSchema";
import { OFFSET, TAKE_RECORDS } from "@/lib/constants/pagination";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    console.log(searchParams);

    const rawData = Object.fromEntries(searchParams.entries());

    const data = studentQuerySchema.parse(rawData);

    const students = await prisma.student.findMany({
      where: {
        class: {
          grade: data.grade,
          major: data.major,
          section: data.section,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip: data.page * OFFSET,
      take: TAKE_RECORDS,
    });

    const totalStudents = await prisma.student.count({
      where: {
        class: {
          grade: data.grade,
          major: data.major,
          section: data.section,
        },
      },
    });

    return Response.json(
      {
        message: "Successfully retrieved list of students by class",
        data: { students },
        totalStudents,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/student",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
