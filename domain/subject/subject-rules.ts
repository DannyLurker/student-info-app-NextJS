import { CreateSubjectSchema } from "@/lib/zod/subject";
import { badRequest, notFound, unprocessableEntity } from "../../lib/errors";
import { SubjectType } from "@/lib/constants/subject";
import { Grade, Major } from "@/lib/constants/class";

export function ensureSubjectsExist(subjects: any[]) {
  if (subjects.length === 0) {
    throw notFound("No subjects found. Create subject data first.");
  }
}

// Multiple majors are not allowed for subjects with type 'MAJOR'.
export function ensureSingleMajorForMajorType(
  record: CreateSubjectSchema["subjectRecords"][0],
  index: number,
) {
  if (
    record.subjectConfig.type === "MAJOR" &&
    record.subjectConfig.allowedMajors.length > 1
  ) {
    throw unprocessableEntity(
      `Row ${index + 1}: Multiple majors are not allowed for MAJOR type subjects.`,
    );
  }
}

export function validateConfigUniqueness(
  record: CreateSubjectSchema["subjectRecords"][0],
  index: number,
  uniqueSubjects: Set<string>,
  subjectMap: Map<
    string,
    { subjectType: SubjectType; majors: Major[]; grades: Grade[] }
  >,
) {
  const { type, allowedGrades, allowedMajors } = record.subjectConfig;

  const gradeSet = new Set(allowedGrades);
  if (gradeSet.size !== allowedGrades.length) {
    throw badRequest(`Row ${index + 1}: Contains duplicated grades.`);
  }

  const majorSet = new Set(allowedMajors);
  if (majorSet.size !== allowedMajors.length) {
    throw badRequest(`Row ${index + 1}: Contains duplicated majors.`);
  }

  record.subjectNames.forEach((name) => {
    // Sort keys to ensure ["A", "B"] and ["B", "A"] are seen as the same
    const configKey = `${name}-${type}-${[...allowedGrades].sort().join()}-${[...allowedMajors].sort().join()}`;

    if (uniqueSubjects.has(configKey)) {
      throw unprocessableEntity(
        `Row ${index + 1}: Subject "${name}" with this configuration already exists.`,
      );
    }

    uniqueSubjects.add(configKey);
    subjectMap.set(name, {
      subjectType: type,
      majors: allowedMajors.sort(),
      grades: allowedGrades.sort(),
    });
  });
}

export function validateSubjectUniqueness(
  uniqueSubjectNames: string[],
  existingSubject: { name: string }[],
) {
  uniqueSubjectNames.forEach((name) => {
    existingSubject.forEach((existingName: { name: string }) => {
      if (existingName.name.toLocaleLowerCase() === name.toLocaleLowerCase()) {
        throw unprocessableEntity(
          `Subject can't be duplicated. ${name} is duplicated `,
        );
      }
    });
  });
}
