import { Grade, Major } from "../constants/class";
import { SubjectType } from "../constants/subject";

type SubjectClient = {
  subjectId: number;
  subjectConfig?: {
    grade?: Grade[] | undefined;
    major?: Major[] | undefined;
    subjectType?: SubjectType | undefined;
  };
  subjectName?: string | undefined;
};
type SubjectServer = {
  subjectConfig: {
    grade: Grade[];
    major: Major[];
    subjectType: SubjectType;
  };
  subjectName: string;
};

function areArraysIdentical(serverArr: string[], clientArr?: string[]) {
  if (!clientArr) return true;
  if (serverArr.length !== clientArr.length) return false;
  return serverArr.every((item) => clientArr.includes(item as any));
}

export function compareSubjectConfig(
  subjectClient: SubjectClient,
  subjectServer: SubjectServer,
) {
  const config = subjectClient.subjectConfig;
  if (!config) return { hasChanged: false, changedData: {} };

  const isGradeChanged = !areArraysIdentical(
    subjectServer.subjectConfig.grade,
    config.grade,
  );

  const isMajorChanged = !areArraysIdentical(
    subjectServer.subjectConfig.major,
    config.major,
  );

  const isTypeChanged =
    config.subjectType !== undefined &&
    subjectServer.subjectConfig.subjectType !== config.subjectType;

  return isGradeChanged || isMajorChanged || isTypeChanged;
}
