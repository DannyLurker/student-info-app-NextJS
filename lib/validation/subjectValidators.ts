import { Grade, Major } from "../constants/class";
import { SubjectType } from "../constants/subject";

type SubjectClient = {
  subjectId: number;
  config?: {
    allowedGrades?: Grade[] | undefined;
    allowedMajors?: Major[] | undefined;
    type?: SubjectType | undefined;
  };
  name?: string | undefined;
};
type SubjectServer = {
  config: {
    allowedGrades: Grade[];
    allowedMajors: Major[];
    type: SubjectType;
  };
  name: string;
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
  const config = subjectClient.config;
  if (!config) return { hasChanged: false, changedData: {} };

  const isGradeChanged = !areArraysIdentical(
    subjectServer.config.allowedGrades,
    config.allowedGrades,
  );

  const isMajorChanged = !areArraysIdentical(
    subjectServer.config.allowedMajors,
    config.allowedMajors,
  );

  const isTypeChanged =
    config.type !== undefined && subjectServer.config.type !== config.type;

  return isGradeChanged || isMajorChanged || isTypeChanged;
}
