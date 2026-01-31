import { prisma } from "@/db/prisma";
import { badRequest, handleError, internalServerError } from "@/lib/errors";
import { subjectSchema } from "@/lib/utils/zodSchema";
import { validateStaffSession } from "@/lib/validation/guards";

export async function POST(req: Request) {
  try {
    await validateStaffSession();

    const rawData = await req.json();

    const data = subjectSchema.parse(rawData);

    const uniqueSubjects = new Set();

    /*
    TODO LIST:
     1. Add subjectType property, it can be general or major
     2. Add a validation to check if it's major, major.length == 1
     */

    const subjectMap = new Map();
    data.subjectRecords.map((subject) => {
      const uniqueSubjectKey = `${subject.subjectName}-${subject.subjectConfig.grade.join("-")}-${subject.subjectConfig.major.join("-")}`;

      if (uniqueSubjects.has(uniqueSubjectKey)) {
        throw badRequest(
          `Duplicate subject: ${subject.subjectName} already exists`,
        );
      }
      subjectMap.set(subject.subjectName, {
        grade: subject.subjectConfig.grade,
        major: subject.subjectConfig.major,
      });
      uniqueSubjects.add(uniqueSubjectKey);
    });

    const uniqueSubjectsArray = Array.from(uniqueSubjects);
    const uniqueSubjectName = uniqueSubjectsArray.map(
      (subject: any) => subject.split("-")[0],
    );

    const existingSubjects = await prisma.subject.findMany({
      where: {
        subjectName: {
          in: uniqueSubjectName,
        },
      },
      select: {
        subjectName: true,
      },
    });

    const existingSubjectNames = existingSubjects.map(
      (subject) => subject.subjectName,
    );

    const missingSubjectNames = uniqueSubjectName.filter(
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
              { major: { hasEvery: subjectConfig.major } },
              { grade: { hasEvery: subjectConfig.grade } },
            ],
          },
        });

        let targetConfig = potentialConfig.find(
          (config) =>
            config.major.length === subjectConfig.config.major.length &&
            config.major.length === subjectConfig.config.major.length,
        );

        if (!targetConfig) {
          targetConfig = await tx.subjectConfig.create({
            data: {
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
