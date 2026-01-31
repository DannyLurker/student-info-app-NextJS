import { auth } from "@/lib/auth/authNode";
import { prisma } from "@/db/prisma";
import { unauthorized, notFound, forbidden } from "@/lib/errors";
import { isStaffRole } from "@/lib/constants/roles";

export async function validateStaffSession() {
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const staff = await prisma.teacher.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      name: true,
    },
  });

  if (!staff) {
    throw notFound("User not found");
  }

  if (!isStaffRole(staff.role)) {
    throw forbidden("You're not allowed to access this");
  }

  return staff;
}
