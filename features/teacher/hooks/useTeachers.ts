import { TEACHER_KEYS } from "@/lib/constants/tanStackQueryKeys";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { teacherApi } from "../services/teacher-api";
import { TeacherFetchType } from "@/lib/constants/teacher";
import { TeachersResponse } from "../types/teacher";
import { toast } from "sonner";
import { UserApi } from "@/features/user/service/user-api";

export const useTeachers = (
  teacherFetchType: TeacherFetchType,
  options?: Partial<UseQueryOptions<TeachersResponse>>,
) => {
  return useQuery({
    queryKey: TEACHER_KEYS.lists(),
    queryFn: () => teacherApi.getAll(teacherFetchType),
    ...options,
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserApi.delete(userId),
    onSuccess: (data) => {
      toast.success(data.message || "Teacher account deleted successfully");
      queryClient.invalidateQueries({
        queryKey: TEACHER_KEYS.lists(),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete Teacher account");
    },
  });
};
