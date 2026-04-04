import { api } from "@/lib/api-client";
import {
  StudentQuerySchema,
  UpdateStudentProfileSchema,
} from "@/lib/zod/student";
import { StudentProfileResponse, StudentReponse } from "./student-types";

export const StudentApi = {
  getAllByClass: async (queries: StudentQuerySchema) => {
    const response = await api.get("/student", {
      params: queries,
    });

    return response.data.data as StudentReponse;
  },
  getProfile: async (id: string) => {
    const response = await api.get("/student/profile", {
      params: {
        studentId: id,
      },
    });

    return response.data.data as StudentProfileResponse;
  },
  updateStudent: async (payload: UpdateStudentProfileSchema) => {
    const response = await api.patch(
      "/staff/user/edit/single/student",
      payload,
    );

    return response.data;
  },
};
