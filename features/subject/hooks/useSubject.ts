import { SUBJECT_KEYS } from "@/lib/constants/tanStackQueryKeys";
import { SubjectQueriesSchema } from "@/lib/zod/subject";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { subjectApi } from "../services/subject-api";
import { GetSubjectResponse } from "../types/subject-types";

export const useSubject = (
  options?: Partial<UseQueryOptions<GetSubjectResponse>>,
) => {
  return useQuery({
    queryKey: SUBJECT_KEYS.lists(),
    queryFn: () => subjectApi.getAll(),
    ...options,
  });
};
