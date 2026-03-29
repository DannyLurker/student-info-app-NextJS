import { api } from "@/lib/api-client";
import { ClassroomWithTeacher } from "./classroom-definitions";

export const ClassroomApi = {
  getAll: async () => {
    const res = await api.get("/staff/classroom");

    return res.data.data as ClassroomWithTeacher[];
  },
};
