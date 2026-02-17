export const TEACHER_FETCH_TYPE = ["all", "nonHomeroom"] as const;
export type TeacherFetchType = (typeof TEACHER_FETCH_TYPE)[number];
