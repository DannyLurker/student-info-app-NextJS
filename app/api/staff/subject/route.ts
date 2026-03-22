import { prisma } from "@/db/prisma";
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
  notFound,
  unprocessableEntity,
} from "@/lib/errors";
import { validateManagementSession } from "@/lib/validation/guards";
import { compareSubjectConfig } from "@/lib/validation/subjectValidators";
import {
  createSubjectSchema,
  getSubjectQueriesSchema,
  patchSubjectSchema,
} from "@/lib/zod/subject";
import { createSubject } from "@/services/subject/subject-services";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    await validateManagementSession();

    const rawData = await req.json();

    const data = createSubjectSchema.parse(rawData);

    const response = await createSubject(data);

    return Response.json(
      {
        message: "Successfully created new subject",
        details: `Created ${response.totalNewSubjects} new subjects.`,
      },

      { status: 201 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(POST) /api/staff/subject",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    await validateManagementSession();

    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const data = getSubjectQueriesSchema.parse(rawParams);

    const whereCondition: Prisma.SubjectWhereInput = {};

    if (data.subjectName && data.subjectName?.length >= MIN_SEARCH_LENGTH) {
      whereCondition.name = {
        contains: data.subjectName,
        mode: "insensitive",
      };
    } else if (data.grade || data.major || data.subjectType) {
      whereCondition.config = {
        AND: [
          data.grade
            ? { allowedGrades: { hasSome: [data.grade] as Grade[] } }
            : {},
          data.major
            ? { allowedMajors: { hasSome: [data.major] as Major[] } }
            : {},
          data.subjectType ? { type: data.subjectType as SubjectType } : {},
        ],
      };
    }

    const subjectRecords = await prisma.subject.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        config: {
          select: {
            allowedGrades: true,
            allowedMajors: true,
            type: true,
          },
        },
      },
      orderBy: {
        name: data.sortOrder,
      },
      skip: data.getAll ? undefined : data.page * OFFSET,
      take: data.getAll ? undefined : TAKE_RECORDS,
    });

    const formattedSubjects = subjectRecords.map((subject) => ({
      id: subject.id,
      subjectName: subject.name,
      subjectConfig: subject.config,
    }));

    const totalSubject = await prisma.subject.count({
      where: whereCondition,
    });

    return Response.json(
      {
        message: "Successfully retrieved subjects data",
        subjects: formattedSubjects,
        totalSubject: totalSubject,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(GET) /api/staff/subject",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await validateManagementSession();

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("subjectId");
    const subjectId = idParam ? parseInt(idParam, 10) : null;

    // Explicit check for NaN or null
    if (!subjectId || isNaN(subjectId)) {
      throw badRequest("Valid Subject ID is required");
    }

    // Atomic Delete: Don't findUnique first. Just try to delete it.
    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return Response.json(
      { message: "Subject deleted Successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(DELETE) /api/staff/subject",
      message: error instanceof Error ? error.message : String(error),
    });

    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    validateManagementSession();
    const rawData = await req.json();
    const data = patchSubjectSchema.parse(rawData);

    const currentSubject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      include: { config: true },
    });

    if (!currentSubject) throw notFound("Subject not found");

    if (data.subjectName) {
      const findDuplicate = await prisma.subject.findUnique({
        where: { name: data.subjectName },
        select: { id: true },
      });

      // Ensure the duplicate found isn't the current record itself
      if (findDuplicate && findDuplicate.id !== data.subjectId) {
        throw unprocessableEntity("A subject with this name already exists.");
      }
    }

    const configChanged = compareSubjectConfig(data, currentSubject);
    const nameChanged =
      data.subjectName && data.subjectName !== currentSubject.name;

    if (!configChanged && !nameChanged) {
      return Response.json({ message: "No data was edited" }, { status: 200 });
    }

    const updateData: any = {};

    if (nameChanged) {
      updateData.name = data.subjectName;
    }

    if (configChanged) {
      const subjectConfig = {
        allowedMajors:
          data.subjectConfig?.allowedMajors ??
          currentSubject.config.allowedMajors,
        allowedGrades:
          data.subjectConfig?.allowedGrades ??
          currentSubject.config.allowedGrades,
        type: data.subjectConfig?.type ?? currentSubject.config.type,
      };

      const potentialConfig = await prisma.subjectConfig.findMany({
        where: {
          allowedMajors: { hasEvery: subjectConfig.allowedMajors },
          allowedGrades: { hasEvery: subjectConfig.allowedGrades },
          type: subjectConfig.type,
        },
      });

      let targetConfig = potentialConfig.find(
        (config: {
          type: SubjectType;
          allowedMajors: Major[];
          allowedGrades: Grade[];
        }) =>
          subjectConfig.type === config.type &&
          subjectConfig.allowedGrades.length === config.allowedGrades.length &&
          subjectConfig.allowedMajors.length === config.allowedMajors.length,
      );

      if (!targetConfig) {
        targetConfig = await prisma.subjectConfig.create({
          data: {
            allowedGrades: subjectConfig.allowedGrades,
            allowedMajors: subjectConfig.allowedMajors,
            type: subjectConfig.type,
          },
        });
      }

      updateData.configId = targetConfig.id;
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
      route: "(PATCH) /api/staff/subject",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
