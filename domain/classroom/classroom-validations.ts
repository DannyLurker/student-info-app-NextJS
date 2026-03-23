import { ClassSection, Grade, Major } from "@/lib/constants/class";
import { badRequest } from "@/lib/errors";
import { getFullClassLabel } from "@/lib/utils/labels";

export const validateClassroomUniquenes = (
  classroomData: { grade: Grade; major: Major; section: ClassSection }[],
  classroomSet: Set<string>,
) => {
  classroomData.forEach(
    (d: { grade: Grade; major: Major; section: ClassSection }) => {
      const classroomKey = `${d.grade}-${d.major}-${d.section}`;

      if (classroomSet.has(classroomKey)) {
        const classLabel = getFullClassLabel(
          d.grade as Grade,
          d.major as Major,
          d.section as ClassSection,
        );
        throw badRequest(`${classLabel} is already exists`);
      }
    },
  );
};

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
