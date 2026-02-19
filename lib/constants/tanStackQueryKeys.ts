import { SubjectQueriesSchema } from "../utils/zodSchema";

export const SUBJECT_KEYS = {
  all: ["subjects"] as const,
  lists: () => [...SUBJECT_KEYS.all, "list"] as const,
  list: (filters: SubjectQueriesSchema) =>
    [...SUBJECT_KEYS.lists(), { filters }] as const,
  details: () => [...SUBJECT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SUBJECT_KEYS.details(), id] as const,
  listsAll: () => [...SUBJECT_KEYS.all, "list", "all"] as const,
};

export const TEACHER_KEYS = {
  all: ["teachers"] as const,
  lists: () => [...TEACHER_KEYS.all, "list"] as const,
  list: (filters: any) => [...TEACHER_KEYS.lists(), { filters }] as const,
  details: () => [...TEACHER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TEACHER_KEYS.details(), id] as const,
  listsAll: () => [...TEACHER_KEYS.all, "list", "all"] as const,
};

export const CLASSROOM_KEYS = {
  all: ["classrooms"] as const,
  nonHomeroom: () => [...CLASSROOM_KEYS.all, "nonHomeroom"] as const,
  lists: () => [...CLASSROOM_KEYS.all, "list"] as const,
  list: (filters: any) => [...CLASSROOM_KEYS.lists(), { filters }] as const,
  details: () => [...CLASSROOM_KEYS.all, "detail"] as const,
  detail: (id: string) => [...CLASSROOM_KEYS.details(), id] as const,
  listsAll: () => [...CLASSROOM_KEYS.all, "list", "all"] as const,
};

export const ATTENDANCE_KEYS = {
  all: ["attendance"] as const,
  lists: () => [...ATTENDANCE_KEYS.all, "list"] as const,
  list: (filters: any) => [...ATTENDANCE_KEYS.lists(), { filters }] as const,
  summaries: () => [...ATTENDANCE_KEYS.all, "summary"] as const,
  summary: (filters: any) =>
    [...ATTENDANCE_KEYS.summaries(), { filters }] as const,
};

export const DEMERIT_POINT_KEYS = {
  all: ["demeritPoints"] as const,
  lists: () => [...DEMERIT_POINT_KEYS.all, "list"] as const,
  list: (filters: any) =>
    [...DEMERIT_POINT_KEYS.lists(), { filters }] as const,
};

export const ASSESSMENT_KEYS = {
  all: ["assessments"] as const,
  lists: () => [...ASSESSMENT_KEYS.all, "list"] as const,
  list: (filters: {
    grade: string;
    major: string;
    section: string;
    subjectId: number;
  }) => [...ASSESSMENT_KEYS.lists(), { filters }] as const,
};
