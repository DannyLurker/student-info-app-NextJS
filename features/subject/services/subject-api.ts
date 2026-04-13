import { api } from "@/lib/api-client";
import { GetSubjectResponse } from "../types/subject-types";
import { SubjectQueriesSchema } from "@/lib/zod/subject";

export const subjectApi = {
  getAll: async () => {
    const response = await api.get("/staff/subject", {
      params: {
        getAll: "true",
        sortOrder: "asc",
      },
    });

    return response.data as GetSubjectResponse;
  },
};
