import { SortBy, SortOrder } from "@/lib/constants/sortingAndFilltering";
import { badRequest, handleError, notFound } from "@/lib/errors";
import { getDayBounds } from "@/lib/utils/date";
import { prisma } from "@/db/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const teacherId = searchParams.get("teacherId");
    const date = searchParams.get("date");
    const sortBy = (searchParams.get("sortBy") || "name") as SortBy;
    const sortOrder = (searchParams.get("sortOrder") || "asc") as SortOrder;
    const searchQuery = searchParams.get("searchQuery") || "";

    if (!teacherId) {
      throw badRequest("Teacher id is missing.");
    }

    if (date) {
      const page = Number(searchParams.get("page")) || 0;

      if (!teacherId || !date) {
        throw badRequest("Missing required field");
      }
      const targetDate = new Date(date);

      const { startOfDay, endOfDay } = getDayBounds(targetDate);

      const existingTeacher = await prisma.homeroomClass.findUnique({
        where: { teacherId: teacherId },
        select: {
          classNumber: true,
          grade: true,
          major: true,
        },
      });

      if (!existingTeacher) {
        return notFound("Teacher not found");
      }

      let findStudents;

      const MIN_SEARCH_LENGTH = 3;

      if (searchQuery.length >= MIN_SEARCH_LENGTH) {
        findStudents = await prisma.student.findMany({
          where: {
            classNumber: existingTeacher.classNumber,
            grade: existingTeacher.grade,
            major: existingTeacher.major,
            name: {
              contains: searchQuery,
              mode: "insensitive",
            },
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
          skip: page * 10,
          take: 10,
        });
      } else if (sortBy === "name") {
        findStudents = await prisma.student.findMany({
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
          orderBy: {
            name: sortOrder === "asc" ? "asc" : "desc",
          },
          skip: page * 10,
          take: 10,
        });
      } else {
        findStudents = await prisma.student.findMany({
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
              orderBy: {
                type: sortOrder === "asc" ? "asc" : "desc",
              },
            },
          },
          skip: page * 10,
          take: 10,
        });
      }

      const totalStudents = await prisma.student.count({
        where: {
          classNumber: existingTeacher.classNumber,
          grade: existingTeacher.grade,
          major: existingTeacher.major,
        },
      });

      // Get attendance stats for the selected date
      const attendanceStats = await prisma.studentAttendance.groupBy({
        by: ["type"],
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          student: {
            classNumber: existingTeacher.classNumber,
            grade: existingTeacher.grade,
            major: existingTeacher.major,
          },
        },
        _count: {
          type: true,
        },
      });

      // Transform stats into usable format
      const stats = {
        sick: 0,
        permission: 0,
        alpha: 0,
        late: 0,
      };

      for (const stat of attendanceStats) {
        if (stat.type === "SICK") stats.sick = stat._count.type;
        else if (stat.type === "PERMISSION")
          stats.permission = stat._count.type;
        else if (stat.type === "ALPHA") stats.alpha = stat._count.type;
        else if (stat.type === "LATE") stats.late = stat._count.type;
      }

      return Response.json(
        {
          message: "Succesfully retrieved homeroom class students data",
          data: {
            students: findStudents,
            totalStudents,
            stats,
          },
        },
        { status: 200 }
      );
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: {
        teachingAssignments: {
          select: {
            grade: true,
            major: true,
            classNumber: true,
            subject: {
              select: {
                subjectName: true,
                id: true,
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
    console.error("API_ERROR", {
      route: "/api/teacher",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
