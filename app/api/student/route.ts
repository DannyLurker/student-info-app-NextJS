import { ClassNumber, Grade, Major } from "@/lib/constants/class";
import { badRequest, handleError } from "@/lib/errors";
import { prisma } from "@/prisma/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const grade = searchParams.get("grade") as Grade;
    const major = searchParams.get("major") as Major;
    const classNumber = searchParams.get("classNumber") as ClassNumber;
    const subjectName = searchParams.get("subjectName");
    const teacherId = searchParams.get("teacherId");
    const page = Number(searchParams.get("page")) || 0;
    const takeRecords = 10;

    if (!grade || !major || !classNumber) {
      throw badRequest("There are missing parameters");
    }

    let findStudents, totalMarks;

    if (subjectName && teacherId) {
      findStudents = await prisma.student.findMany({
        where: {
          grade: grade,
          major: major,
          classNumber: classNumber,
        },
        select: {
          id: true,
          name: true,
          subjectMarks: {
            where: {
              subjectName: subjectName,
            },
            select: {
              id: true,
              marks: {
                select: {
                  id: true,
                  assessmentNumber: true,
                  score: true,
                  type: true,
                  description: {
                    select: {
                      detail: true,
                      dueAt: true,
                      givenAt: true,
                    },
                  },
                },
                skip: page * 10,
                take: takeRecords,
              },
            },
          },
        },
      });
      totalMarks = await prisma.mark.count({
        where: {
          subjectMarkId: findStudents[0].subjectMarks[0].id,
        },
      });
    } else {
      findStudents = await prisma.student.findMany({
        where: {
          grade: grade,
          major: major,
          classNumber: classNumber,
        },
        select: {
          id: true,
          name: true,
        },
        skip: page * 10,
        take: takeRecords,
      });
    }

    const totalStudents = await prisma.student.count({
      where: {
        grade: grade,
        major: major,
        classNumber: classNumber,
      },
    });

    return Response.json(
      {
        message: "Successfully retrieved list of students by class",
        data: { students: findStudents, totalMarks },
        totalStudents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/student",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
