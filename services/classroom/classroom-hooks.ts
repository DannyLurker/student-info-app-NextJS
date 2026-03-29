import { CLASSROOM_KEYS } from "@/lib/constants/tanStackQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { ClassroomApi } from "./classroom-api";

export const useClassroom = () =>
  useQuery({
    queryKey: CLASSROOM_KEYS.listsAll(),
    queryFn: ClassroomApi.getAll,
    staleTime: 1000 * 60 * 5,
  });
