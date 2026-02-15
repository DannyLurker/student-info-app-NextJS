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

    //Validation
    data.subjectRecords.map((record, index) => {
      // Multiple majors are not allowed for subjects with type 'MAJOR'.
      if (
        record.subjectConfig.type === "MAJOR" &&
        record.subjectConfig.allowedMajors.length > 1
      ) {
        throw unprocessableEntity(
          `Row ${index + 1}: Multiple majors are not allowed for MAJOR type subjects.`,
        );
      }

      record.subjectNames.forEach((subjectName) => {
        const uniqueGrade = new Set();
        const uniqueMajor = new Set();

        // Can't be duplicted
        record.subjectConfig.allowedGrades.forEach((grade) => {
          if (uniqueGrade.has(grade)) {
            throw badRequest(`row ${index + 1}: Grade ${grade} is duplicated`);
          }

          uniqueGrade.add(grade);
        });

        // Can't be duplicted
        record.subjectConfig.allowedMajors.forEach((major) => {
          if (uniqueMajor.has(major)) {
            throw badRequest(`row ${index + 1}: Major ${major} is duplicated`);
          }

          uniqueMajor.add(major);
        });

        const uniqueSubjectKey = `${subjectName}-${record.subjectConfig.type}-${record.subjectConfig.allowedGrades.join("-")}-${record.subjectConfig.allowedMajors.join("-")}`;

        if (uniqueSubjects.has(uniqueSubjectKey)) {
          throw unprocessableEntity(
            `Duplicate subject: ${subjectName}. Configuration: ${record.subjectConfig.type}-${record.subjectConfig.allowedGrades.join("-")}-${record.subjectConfig.allowedMajors.join("-")}, already exists`,
          );
        }

        subjectMap.set(subjectName, {
          subjectType: record.subjectConfig.type,
          grade: record.subjectConfig.allowedGrades,
          major: record.subjectConfig.allowedMajors,
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
        name: {
          in: uniqueSubjectNames,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
      },
    });

    uniqueSubjectNames.forEach((name) => {
      existingSubjects.forEach((existingName) => {
        console.log(existingName);
        if (
          existingName.name.toLocaleLowerCase() === name.toLocaleLowerCase()
        ) {
          throw unprocessableEntity(
            `Subject can't be duplicated. ${name} is duplicated `,
          );
        }
      });
    });

    if (existingSubjects.length === uniqueSubjectNames.length) {
      throw unprocessableEntity(
        "All subjects in your request are already present in the database.",
      );
    }

    const existingSubjectNames = existingSubjects.map(
      (subject) => subject.name,
    );

    const missingSubjectNames = uniqueSubjectNames.filter(
      (subjectName) => !existingSubjectNames.includes(subjectName),
    );

    await prisma.$transaction(async (tx) => {
      for (const subjectName of missingSubjectNames) {
        const subjectConfig = subjectMap.get(subjectName);

        if (!subjectConfig) {
          throw internalServerError(
            `Mapping failed for subject: ${subjectName}`,
          );
        }

        let potentialConfig = await tx.subjectConfig.findMany({
          where: {
            AND: [
              { type: subjectConfig.subjectType },
              { allowedMajors: { hasEvery: subjectConfig.major } },
              { allowedGrades: { hasEvery: subjectConfig.grade } },
            ],
          },
        });

        let targetConfig = potentialConfig.find(
          (config) =>
            config.type === subjectConfig.subjectType &&
            config.allowedMajors.length === subjectConfig.major.length &&
            config.allowedGrades.length === subjectConfig.grade.length,
        );

        if (!targetConfig) {
          targetConfig = await tx.subjectConfig.create({
            data: {
              type: subjectConfig.subjectType,
              allowedMajors: subjectConfig.major,
              allowedGrades: subjectConfig.grade,
            },
          });
        }

        await tx.subject.create({
          data: {
            name: subjectName,
            configId: targetConfig.id,
            type: targetConfig.type,
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
      route: "(POST) /api/staff/subject",
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
      skip: data.page * OFFSET,
      take: TAKE_RECORDS,
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
    await validateStaffSession();

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
      { message: "Successfully deleted subject" },
      { status: 200 },
    );
  } catch (error) {
    // Prisma error code P2025 means "Record to delete does not exist."
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ message: "Subject not found" }, { status: 404 });
    }

    console.error("API_ERROR", {
      route: "(DELETE) /api/staff/subject",
      message: error instanceof Error ? error.message : String(error),
    });

    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    validateStaffSession();
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
        (config) =>
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
