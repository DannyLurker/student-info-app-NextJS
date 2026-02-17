import { Major } from "@/db/prisma/src/generated/prisma/enums";
import { ClassSection, Grade } from "../constants/class";

type classServer = {
  id: number;
  grade: Grade;
  major: Major;
  section: string | ClassSection;
  homeroomTeacherId: string | null;
};

type classClient = {
  id: number;
  classSchema: {
    grade: Grade;
    major: Major;
    section: ClassSection;
  };
  homeroomTeacherId?: string;
};

export function compareClassAtributes(
  classServer: classServer,
  classClient: classClient,
) {
  const changedData: any = {};

  const isGradeChanged = classServer.grade !== classClient.classSchema.grade;

  if (isGradeChanged) changedData.grade = classClient.classSchema.grade;

  const isMajorChanged = classServer.major !== classClient.classSchema.major;

  if (isMajorChanged) changedData.major = classClient.classSchema.major;

  const isClassSectionChanged =
    classServer.section !== classClient.classSchema.section;

  if (isClassSectionChanged)
    changedData.section = classClient.classSchema.section;

  const isTeacherIdChanged =
    classServer.homeroomTeacherId !==
    (classClient.homeroomTeacherId == undefined
      ? null
      : classClient.homeroomTeacherId);

  if (isTeacherIdChanged)
    changedData.homeroomTeacherId =
      classClient.homeroomTeacherId == undefined
        ? null
        : classClient.homeroomTeacherId;

  const hasChanged =
    isGradeChanged ||
    isMajorChanged ||
    isClassSectionChanged ||
    isTeacherIdChanged;

  return { hasChanged, changedData };
}
