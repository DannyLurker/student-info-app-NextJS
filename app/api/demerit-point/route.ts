import {
  categoryLabelMap,
  SINGLE_PER_DAY_CATEGORIES,
  SinglePerDayCategories,
  ValidInfractionType,
} from "@/lib/constants/discplinary";
import { badRequest, handleError, notFound } from "@/lib/errors";
import { getSemester, getSemesterDateRange } from "@/lib/utils/date";
import {
  createDemeritPointSchema,
  updateDemeritPointSchema,
} from "@/lib/utils/zodSchema";
import { prisma } from "@/db/prisma";
import { validateTeacherSession } from "@/lib/validation/guards";
import {
  DemeritPointCreateManyInput,
  DemeritPointWhereInput,
} from "@/db/prisma/src/generated/prisma/models";
import { OFFSET, TAKE_RECORDS } from "@/lib/constants/pagination";

// The funcionality of "category is SinglePerDayCategories" is if the function return true, the category must be "LATE" or "INCOMPLETE_ATTRIBUTES"
function isSinglePerDayCategory(
  category: ValidInfractionType,
): category is SinglePerDayCategories {
  return SINGLE_PER_DAY_CATEGORIES.includes(category as SinglePerDayCategories);
}

export async function POST(req: Request) {
  try {
    const teacherSession = await validateTeacherSession();

    const rawData = await req.json();
    const data = createDemeritPointSchema.parse(rawData);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const demeritPointDate = new Date(data.date);

    const { start: semesterStart, end: semesterEnd } =
      getSemesterDateRange(today);

    if (demeritPointDate < semesterStart || demeritPointDate > semesterEnd) {
      const semesterNum = getSemester(today);
      throw badRequest(
        `Attendance date is outside the current semester (Semester ${semesterNum}). ` +
          `Allowed range: ${semesterStart.toISOString().split("T")[0]} to ${semesterEnd.toISOString().split("T")[0]}.`,
      );
    }

    // Just in case, If we can validate through frontend, we dont have to revalidate it again in backend
    const uniqueStudentIds = [...new Set(data.studentsId)] as string[];

    const students = await prisma.user.findMany({
      where: {
        id: {
          in: uniqueStudentIds,
        },
      },
      select: {
        id: true,
        name: true,
        studentProfile: {
          select: {
            demerits: {
              where: {
                date: new Date(data.date).toISOString(),
              },
              select: {
                category: true,
              },
            },
          },
        },
      },
    });

    const demeritPointsToCreate: DemeritPointCreateManyInput[] = [];

    if (students.length === 0) {
      throw notFound("No student data found");
    }

    for (const student of students) {
      if (isSinglePerDayCategory(data.demeritCategory)) {
        const lateDemeritRecord = student.studentProfile!.demerits.find(
          (d) => d.category == "LATE",
        );

        if (lateDemeritRecord?.category) {
          throw badRequest(
            `This ${student.name} already has "${categoryLabelMap[lateDemeritRecord.category]}" problem. Only one per day`,
          );
        }

        const attributesDemeritRecord = student.studentProfile!.demerits.find(
          (d) => d.category == "UNIFORM",
        );

        if (attributesDemeritRecord?.category) {
          throw badRequest(
            `This ${student.name} already has "${categoryLabelMap[attributesDemeritRecord.category]}" problem. Only one per day`,
          );
        }
      }

      demeritPointsToCreate.push({
        studentId: student.id,
        category: data.demeritCategory as ValidInfractionType,
        points: data.points,
        date: new Date(data.date).toISOString(),
        description: data.description,
        recordedById: teacherSession.userId,
      });
    }

    await prisma.demeritPoint.createMany({
      data: demeritPointsToCreate,
    });

    return Response.json(
      {
        message: "Successfully created demerit point record",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(POST) /api/demerit-point",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    const teacherSession = await validateTeacherSession();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page"));

    const whereFilter: DemeritPointWhereInput = {
      recordedById: teacherSession.userId,
    };

    const [assignedDemeritPoints, totalRecords] = await Promise.all([
      prisma.demeritPoint.findMany({
        where: whereFilter,
        select: {
          id: true,
          points: true,
          category: true,
          date: true,
          description: true,
          student: {
            select: {
              user: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
        take: TAKE_RECORDS,
        skip: page * OFFSET,
      }),
      prisma.demeritPoint.count({
        where: whereFilter,
      }),
    ]);

    return Response.json(
      {
        message: "Successfully retrieved assigned demerit point records",
        data: assignedDemeritPoints,
        totalRecords,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(GET )/api/demerit-point",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    validateTeacherSession();

    const { searchParams } = new URL(req.url);

    const demeritRecordIdParam = Number(searchParams.get("demeritRecordId"));

    if (!demeritRecordIdParam) {
      throw badRequest("Demerit point ID is missing");
    }

    await prisma.demeritPoint.delete({
      where: {
        id: demeritRecordIdParam,
      },
    });

    return Response.json(
      {
        message: "Successfully deleted demerit point record",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(DELETE) /api/demerit-point",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    validateTeacherSession();
    const body = await req.json();
    const data = updateDemeritPointSchema.parse(body);

    const existingDemeritPoint = await prisma.demeritPoint.findUnique({
      where: {
        id: data.demeritRecordId,
      },
      select: {
        id: true,
        category: true,
        student: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!existingDemeritPoint) {
      throw notFound("Demerit point record was not found");
    }

    const demeritPointRecords = await prisma.demeritPoint.findMany({
      where: {
        date: new Date(data.date).toISOString(),
        studentId: existingDemeritPoint?.student.user.id,
      },
    });

    const findSingleCategory = demeritPointRecords.find(
      (record) => record.category === existingDemeritPoint.category,
    );

    if (
      isSinglePerDayCategory(existingDemeritPoint.category) &&
      findSingleCategory?.category === data.demeritCategory
    ) {
      throw badRequest(
        `This ${existingDemeritPoint.student.user.name} already has "${categoryLabelMap[existingDemeritPoint.category]}" problem. Only one per day`,
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const demeritRecordDate = new Date(data.date);

    const { start: semesterStart, end: semesterEnd } =
      getSemesterDateRange(today);

    if (demeritRecordDate < semesterStart || demeritRecordDate > semesterEnd) {
      const semesterNum = getSemester(today);
      throw badRequest(
        `Attendance date is outside the current semester (Semester ${semesterNum}). ` +
          `Allowed range: ${semesterStart.toISOString().split("T")[0]} to ${semesterEnd.toISOString().split("T")[0]}.`,
      );
    }

    await prisma.demeritPoint.update({
      where: {
        id: data.demeritRecordId,
      },
      data: {
        category: data.demeritCategory,
        points: data.points,
        date: new Date(data.date),
        description: data.description,
      },
    });

    return Response.json(
      {
        message: "Successfully updated demerit point record",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(PATCH) /api/demerit-point",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
