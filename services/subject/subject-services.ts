import { prisma } from "@/db/prisma";
import {
  ensureSingleMajorForMajorType,
  validateConfigUniqueness,
  validateSubjectUniqueness,
} from "@/domain/subject/subjectRules";
import { Grade, Major } from "@/lib/constants/class";
import { SubjectType } from "@/lib/constants/subject";
import { internalServerError, unprocessableEntity } from "@/lib/errors";
import { CreateSubjectSchema } from "@/lib/zod/subject";
import { findSubjects } from "@/repositories/subject-repository";
import { Prisma } from "@prisma/client";

export async function createSubject(data: CreateSubjectSchema) {
  const uniqueSubjects = new Set<string>();
  const subjectMap = new Map<
    string,
    { subjectType: SubjectType; majors: Major[]; grades: Grade[] }
  >();

  //Validation
  data.subjectRecords.map((record, index) => {
    // Multiple majors are not allowed for subjects with type 'MAJOR'.
    ensureSingleMajorForMajorType(record, index);

    validateConfigUniqueness(record, index, uniqueSubjects, subjectMap);
  });

  const uniqueSubjectsArray = Array.from(uniqueSubjects);
  const uniqueSubjectNames = uniqueSubjectsArray.map(
    (subject: any) => subject.split("-")[0],
  );

  const subjectsByNameQuery = Prisma.validator<Prisma.SubjectWhereInput>()({
    name: {
      in: uniqueSubjectNames,
      mode: "insensitive",
    },
  });

  const subjectNameSelect = Prisma.validator<Prisma.SubjectSelect>()({
    name: true,
  });

  const existingSubjects = await findSubjects(
    subjectsByNameQuery,
    subjectNameSelect,
  );

  validateSubjectUniqueness(uniqueSubjectNames, existingSubjects);

  if (existingSubjects.length === uniqueSubjectNames.length) {
    throw unprocessableEntity(
      "All subjects in your request are already present in the database.",
    );
  }

  await prisma.$transaction(async (tx) => {
    const uniqueConfigs = Array.from(
      new Set(
        uniqueSubjectNames.map((name) => {
          const config = subjectMap.get(name);

          if (!config) return null;

          return JSON.stringify({
            ...config,
            // Sort these so the string is ALWAYS the same for the same data
            major: [...config.majors].sort(),
            grade: [...config.grades].sort(),
          });
        }),
      ),
    )
      .filter((str): str is string => !!str)
      .map((str) => JSON.parse(str));

    const configMap = new Map();

    for (const config of uniqueConfigs) {
      // Exact match check - many DBs allow array equals
      let targetConfig = await tx.subjectConfig.findFirst({
        where: {
          type: config.subjectType,
          allowedMajors: { equals: config.major },
          allowedGrades: { equals: config.grade },
        },
      });

      if (!targetConfig) {
        targetConfig = await tx.subjectConfig.create({
          data: {
            type: config.subjectType,
            allowedMajors: config.major,
            allowedGrades: config.grade,
          },
        });
      }

      console.log("100: ", JSON.stringify(targetConfig));

      // Store the ID so subjects can find it without another query

      const configKey = JSON.stringify({
        subjectType: targetConfig.type,
        majors: targetConfig.allowedMajors,
        grades: targetConfig.allowedGrades,
      });

      console.log("110: ", configKey);

      configMap.set(configKey, targetConfig);
    }

    // 2. Use createMany for the subjects - THIS IS THE BIG WIN
    const subjectsToCreate = uniqueSubjectNames.map((name) => {
      const config = subjectMap.get(name);
      const targetConfig = configMap.get(JSON.stringify(config));

      console.log("112: ", JSON.stringify(config));

      console.log("114: ", configMap.get(JSON.stringify(config)));

      return {
        name,
        configId: targetConfig.id,
        type: targetConfig.type,
      };
    });

    await tx.subject.createMany({
      data: subjectsToCreate,
      skipDuplicates: true,
    });
  });

  return { totalNewSubjects: uniqueSubjectNames.length };
}
