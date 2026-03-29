import { STUDENT_KEY } from "@/lib/constants/tanStackQueryKeys";
import { StudentQuerySchema } from "@/lib/zod/student";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { StudentApi } from "./student-api";
import { StudentReponse } from "./student-types";

export const useStudent = (
  queries: StudentQuerySchema,
  options?: Partial<UseQueryOptions<StudentReponse>>,
) => {
  return useQuery({
    queryKey: [STUDENT_KEY.list(queries)],
    queryFn: () => StudentApi.getAll(queries),
    ...options,
  });
};
