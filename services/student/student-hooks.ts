import { STUDENT_KEY } from "@/lib/constants/tanStackQueryKeys";
import {
  StudentQuerySchema,
  UpdateStudentProfileSchema,
} from "@/lib/zod/student";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { StudentApi } from "./student-api";
import { StudentProfileResponse, StudentReponse } from "./student-types";
import { toast } from "sonner";

export const useStudent = (
  queries: StudentQuerySchema,
  options?: Partial<UseQueryOptions<StudentReponse>>,
) => {
  return useQuery({
    queryKey: STUDENT_KEY.list(queries),
    queryFn: () => StudentApi.getAllByClass(queries),
    ...options,
  });
};

export const useStudentProfile = (
  id: string,
  options?: Partial<UseQueryOptions<StudentProfileResponse>>,
) => {
  return useQuery({
    queryKey: STUDENT_KEY.detail(id),
    queryFn: () => StudentApi.getProfile(id),
    ...options,
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStudentProfileSchema) =>
      StudentApi.updateStudent(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Student profile updated successfully");
      queryClient.invalidateQueries({
        queryKey: STUDENT_KEY.detail(res.data.studentId),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update student profile");
    },
  });
};
