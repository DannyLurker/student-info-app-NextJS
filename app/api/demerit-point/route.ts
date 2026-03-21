import {
  categoryLabelMap,
  SINGLE_PER_DAY_CATEGORIES,
  SinglePerDayCategories,
  ValidInfractionType,
} from "@/lib/constants/discplinary";
import { badRequest, handleError, notFound } from "@/lib/errors";
import { getSemester, getSemesterDateRange } from "@/lib/utils/date";

import { prisma } from "@/db/prisma";
import { validateTeacherSession } from "@/lib/validation/guards";
import { OFFSET, TAKE_RECORDS } from "@/lib/constants/pagination";
import { Prisma } from "@prisma/client";
import {
  createDemeritPointSchema,
  updateDemeritPointSchema,
} from "@/lib/zod/demerit-point";
import { createDemeritPoint } from "@/services/demerit-point/demerit-point-service";
import { isSinglePerDayCategory } from "@/domain/demerit-point/demerit-point-rules";
import { printConsoleError } from "@/lib/utils/printError";

export async function POST(req: Request) {
  try {
    const teacherSession = await validateTeacherSession();

    const rawData = await req.json();
    const data = createDemeritPointSchema.parse(rawData);

    await createDemeritPoint(data, teacherSession);

    return Response.json(
      {
        message: "Successfully created demerit point record",
      },
      { status: 201 },
    );
  } catch (error) {
    printConsoleError(error, "POST", "/api/demerit-point");
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    const teacherSession = await validateTeacherSession();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page"));

    const whereFilter: Prisma.DemeritPointWhereInput = {
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
      (record: { category: ValidInfractionType }) =>
        record.category === existingDemeritPoint.category,
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
