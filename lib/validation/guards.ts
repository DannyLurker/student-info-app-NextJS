import { auth } from "@/lib/auth/authNode";
import { prisma } from "@/db/prisma";
import { unauthorized, notFound, forbidden } from "@/lib/errors";
import { hasManagementAccess } from "@/lib/constants/roles";

export async function validateStaffSession() {
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const staff = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    select: {
      userId: true,
      staffRole: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!staff) {
    throw notFound("User not found");
  }

  if (!hasManagementAccess(staff.staffRole)) {
    throw forbidden("You're not allowed to access this");
  }

  return staff;
}
