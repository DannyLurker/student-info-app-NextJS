export const ASSESSMENT_TYPES = [
  "SCHOOLWORK",
  "HOMEWORK",
  "QUIZ",
  "EXAM",
  "PROJECT",
  "GROUP_WORK",
] as const;

export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];
