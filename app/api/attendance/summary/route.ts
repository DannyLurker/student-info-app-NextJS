import { handleError } from "@/lib/errors";
import {
  MIN_SEARCH_LENGTH,
  OFFSET,
  TAKE_RECORDS,
} from "@/lib/constants/pagination";
import { attendanceSummaryQueries } from "@/lib/utils/zodSchema";
import { prisma } from "@/db/prisma";
import { validateHomeroomTeacherSession } from "@/lib/validation/guards";

export async function GET(req: Request) {
  try {
    const homeroomTeacherSession = await validateHomeroomTeacherSession();

    const { searchParams } = new URL(req.url);

    const rawParams = Object.fromEntries(searchParams.entries());

    const data = attendanceSummaryQueries.parse(rawParams);

    let students;

    const classIdSession = homeroomTeacherSession.homeroom?.id;

    const selectData = {
      name: true,
      id: true,
    };

    if (data.searchQuery && data.searchQuery?.length > MIN_SEARCH_LENGTH) {
      students = await prisma.user.findMany({
        where: {
          name: {
            contains: data.searchQuery,
            mode: "insensitive",
          },
          studentProfile: {
            classId: classIdSession,
          },
        },
        select: selectData,
        skip: data.page * OFFSET,
        take: TAKE_RECORDS,
      });
    } else {
      students = await prisma.user.findMany({
        where: {
          studentProfile: {
            classId: classIdSession,
          },
        },
        select: selectData,
        skip: data.page * OFFSET,
        take: TAKE_RECORDS,
        orderBy: {
          name: data.sortOrder === "asc" ? "asc" : "desc",
        },
      });
    }

    const studentIds = students.map((student) => student.id);

    const stats = await prisma.attendance.groupBy({
      by: ["type", "studentId"],
      where: {
        studentId: {
          in: studentIds,
        },
      },
      _count: true,
    });

    const studentAttendanceSummaries = students.map((student) => {
      const summary = stats
        .filter((s) => s.studentId === student.id)
        .map((s) => ({ type: s.type, count: s._count }));

      return {
        id: student.id,
        name: student.name,
        attendanceSummary: summary,
      };
    });

    const totalStudents = await prisma.student.count({
      where: {
        classId: classIdSession,
      },
    });

    return Response.json(
      {
        message: "Successfully retrieved students' attendance summary",
        class: {
          grade: homeroomTeacherSession.homeroom?.grade,
          major: homeroomTeacherSession.homeroom?.major,
          classNumber: homeroomTeacherSession.homeroom?.section,
        },
        students: studentAttendanceSummaries,
        totalStudents: totalStudents,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/student/attendance/summary",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
