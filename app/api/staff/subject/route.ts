import { prisma } from "@/db/prisma";
import { Prisma } from "@/db/prisma/src/generated/prisma/client";
import { Grade, Major } from "@/lib/constants/class";
import {
  MIN_SEARCH_LENGTH,
  OFFSET,
  TAKE_RECORDS,
} from "@/lib/constants/pagination";
import { SubjectType } from "@/lib/constants/subject";
import {
  badRequest,
  handleError,
  internalServerError,
  notFound,
  unprocessableEntity,
} from "@/lib/errors";
import {
  createSubjectSchema,
  getSubjectQueriesSchema,
  patchSubjectSchema,
} from "@/lib/utils/zodSchema";
import { validateStaffSession } from "@/lib/validation/guards";
import { compareSubjectConfig } from "@/lib/validation/subjectValidators";

export async function POST(req: Request) {
  try {
    await validateStaffSession();

    const rawData = await req.json();

    const data = createSubjectSchema.parse(rawData);

    const uniqueSubjects = new Set();
    const subjectMap = new Map();

    data.subjectRecords.map((record, index) => {
      if (
        record.subjectConfig.subjectType === "MAJOR" &&
        record.subjectConfig.major.length > 1
      ) {
        throw unprocessableEntity(
          `Row ${index + 1}: Multiple majors are not allowed for MAJOR type subjects.`,
        );
      }

      record.subjectNames.map((subjectName) => {
        const uniqueSubjectKey = `${subjectName}-${record.subjectConfig.subjectType}-${record.subjectConfig.grade.join("-")}-${record.subjectConfig.major.join("-")}`;

        if (uniqueSubjects.has(uniqueSubjectKey)) {
          throw unprocessableEntity(
            `Duplicate subject: ${subjectName}. Configuration: ${record.subjectConfig.subjectType}-${record.subjectConfig.grade.join("-")}-${record.subjectConfig.major.join("-")}, already exists`,
          );
        }

        subjectMap.set(subjectName, {
          subjectType: record.subjectConfig.subjectType,
          grade: record.subjectConfig.grade,
          major: record.subjectConfig.major,
        });
        uniqueSubjects.add(uniqueSubjectKey);
      });
    });

    const uniqueSubjectsArray = Array.from(uniqueSubjects);
    const uniqueSubjectNames = uniqueSubjectsArray.map(
      (subject: any) => subject.split("-")[0],
    );

    const existingSubjects = await prisma.subject.findMany({
      where: {
        subjectName: {
          in: uniqueSubjectNames,
        },
      },
      select: {
        subjectName: true,
      },
    });

    if (existingSubjects.length === uniqueSubjectNames.length) {
      throw unprocessableEntity(
        "All subjects in your request are already present in the database.",
      );
    }

    const existingSubjectNames = existingSubjects.map(
      (subject) => subject.subjectName,
    );

    const missingSubjectNames = uniqueSubjectNames.filter(
      (subjectName) => !existingSubjectNames.includes(subjectName),
    );

    await prisma.$transaction(async (tx) => {
      for (const subjectName of missingSubjectNames) {
        const subjectConfig = subjectMap.get(subjectName);

        console.log(subjectConfig);

        if (!subjectConfig) {
          throw internalServerError(
            `Mapping failed for subject: ${subjectName}`,
          );
        }

        let potentialConfig = await tx.subjectConfig.findMany({
          where: {
            AND: [
              { subjectType: subjectConfig.subjectType },
              { major: { hasEvery: subjectConfig.major } },
              { grade: { hasEvery: subjectConfig.grade } },
            ],
          },
        });

        let targetConfig = potentialConfig.find(
          (config) =>
            config.subjectType === subjectConfig.subjectType &&
            config.major.length === subjectConfig.major.length &&
            config.grade.length === subjectConfig.grade.length,
        );

        if (!targetConfig) {
          targetConfig = await tx.subjectConfig.create({
            data: {
              subjectType: subjectConfig.subjectType,
              major: subjectConfig.major,
              grade: subjectConfig.grade,
            },
          });
        }

        await tx.subject.create({
          data: {
            subjectName: subjectName,
            subjectConfigId: targetConfig.id,
          },
        });
      }
    });

    return Response.json(
      {
        message: "Successfully created new subject",
        details: `Created ${missingSubjectNames.length} new subjects.`,
      },

      { status: 201 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/staff/subject",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    await validateStaffSession();

    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const data = getSubjectQueriesSchema.parse(rawParams);

    const whereCondition: Prisma.SubjectWhereInput = {};

    if (data.subjectName && data.subjectName?.length >= MIN_SEARCH_LENGTH) {
      whereCondition.subjectName = {
        contains: data.subjectName,
        mode: "insensitive",
      };
    } else if (data.subjectConfig) {
      const { grade, major, subjectType } = data.subjectConfig;
      whereCondition.subjectConfig = {
        AND: [
          grade ? { grade: { hasSome: grade as Grade[] } } : {},
          major ? { major: { hasSome: major as Major[] } } : {},
          subjectType ? { subjectType: subjectType as SubjectType } : {},
        ],
      };
    }

    const subjectRecords = await prisma.subject.findMany({
      where: whereCondition,
      select: {
        id: true,
        subjectConfig: {
          select: {
            grade: true,
            major: true,
            subjectType: true,
          },
        },
      },
      orderBy: {
        subjectName: data.sortOrder,
      },
      skip: data.page * OFFSET,
      take: TAKE_RECORDS,
    });

    const totalSubject = await prisma.subject.count({
      where: whereCondition,
    });

    return Response.json(
      {
        message: "Successfully retrieved subjects data",
        subjects: subjectRecords,
        totalSubject: totalSubject,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/staff/subject",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await validateStaffSession();

    const { searchParams } = new URL(req.url);

    const subjectId = Number(searchParams.get("subjectId"));

    if (!subjectId) {
      throw badRequest("Subject id is missing");
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: subjectId,
      },
      select: {
        id: true,
      },
    });

    if (!subject) {
      return notFound("Subject not found");
    }

    await prisma.subject.delete({
      where: {
        id: subject.id,
      },
    });

    return Response.json(
      {
        message: "Successfully deleted subject",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/staff/subject",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    validateStaffSession();
    const rawData = await req.json();
    const data = patchSubjectSchema.parse(rawData);

    const currentSubject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      include: { subjectConfig: true },
    });

    if (!currentSubject) throw notFound("Subject not found");

    const findDuplicate = await prisma.subject.findUnique({
      where: { subjectName: data.subjectName },
      select: {
        id: true,
      },
    });

    if (findDuplicate) {
      throw unprocessableEntity("A subject with this name already exists.");
    }

    const configChanged = compareSubjectConfig(data, currentSubject);
    const nameChanged =
      data.subjectName && data.subjectName !== currentSubject.subjectName;

    if (!configChanged && !nameChanged) {
      return Response.json({ message: "No data was edited" }, { status: 200 });
    }

    const updateData: any = {};

    if (nameChanged) {
      updateData.subjectName = data.subjectName;
    }

    if (configChanged) {
      const subjectConfig = {
        major: data.subjectConfig?.major ?? currentSubject.subjectConfig.major,
        grade: data.subjectConfig?.grade ?? currentSubject.subjectConfig.grade,
        subjectType:
          data.subjectConfig?.subjectType ??
          currentSubject.subjectConfig.subjectType,
      };

      const potentialConfig = await prisma.subjectConfig.findMany({
        where: {
          major: { hasEvery: subjectConfig.major },
          grade: { hasEvery: subjectConfig.grade },
          subjectType: subjectConfig.subjectType,
        },
      });

      let targetConfig = potentialConfig.find(
        (config) =>
          subjectConfig.subjectType === config.subjectType &&
          subjectConfig.grade.length === config.grade.length &&
          subjectConfig.major.length === config.major.length,
      );

      if (!targetConfig) {
        targetConfig = await prisma.subjectConfig.create({
          data: subjectConfig,
        });
      }

      updateData.subjectConfigId = targetConfig.id;
    }

    await prisma.subject.update({
      where: { id: data.subjectId },
      data: updateData,
    });

    return Response.json(
      { message: "Successfully updated subject data" },
      { status: 201 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/staff/subject",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
