import { api } from "@/lib/api-client";

export const UserApi = {
  delete: async (userId: string) => {
    const response = await api.delete(`/staff/user/teacher/${userId}`);

    return response.data;
  },
};
