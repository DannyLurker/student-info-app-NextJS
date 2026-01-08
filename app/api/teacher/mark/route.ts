import { handleError, interalServerError, notFound } from "@/lib/errors";
import { getSemester } from "@/lib/utils/date";
import { markRecords } from "@/lib/utils/zodSchema";
import { prisma } from "@/prisma/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = markRecords.parse(body);

    // TODO: Working on this
    await prisma.$transaction(async (tx) => {
      for (const student of data.students) {
        const subjectMark = await tx.subjectMark.findUnique({
          where: {
            studentId_subjectName_academicYear_semester: {
              studentId: student.studentId,
              subjectName: student.subjectName,
              academicYear: String(new Date().getFullYear()),
              semester: getSemester(new Date()) === 1 ? "FIRST" : "SECOND",
            },
          },
        });

        if (!subjectMark) {
          throw interalServerError();
        }

        // await tx.mark.update({
        //   where: {

        //     subjectMarkId: subjectMark?.id as number,
        //   },
        //   data: {},
        // });
      }
    });
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/teacher/grade",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
