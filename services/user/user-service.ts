import { prisma } from "@/db/prisma";
import { deleteUserById } from "@/features/user/repository/user-repository";

export const deleteUser = async (userId: string) => {
  await deleteUserById(userId, prisma);
};
