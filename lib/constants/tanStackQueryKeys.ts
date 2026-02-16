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
  all: ["teacher"] as const,
  lists: () => [...TEACHER_KEYS.all, "list"] as const,
  list: (filters: any) => [...TEACHER_KEYS.lists(), { filters }] as const,
  details: () => [...TEACHER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TEACHER_KEYS.details(), id] as const,
  listsAll: () => [...TEACHER_KEYS.all, "list", "all"] as const,
};
