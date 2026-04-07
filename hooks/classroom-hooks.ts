import { CLASSROOM_KEYS } from "@/lib/constants/tanStackQueryKeys";
import { ClassroomApi } from "@/services/classroom/classroom-api";
import { useQuery } from "@tanstack/react-query";

export const useClassroom = () =>
  useQuery({
    queryKey: CLASSROOM_KEYS.listsAll(),
    queryFn: ClassroomApi.getAll,
    staleTime: 1000 * 60 * 5,
  });
