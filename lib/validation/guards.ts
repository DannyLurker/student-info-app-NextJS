import { auth } from "@/lib/auth/authNode";
import { prisma } from "@/db/prisma";
import { unauthorized, notFound, forbidden } from "@/lib/errors";
import { hasManagementAccess } from "@/lib/constants/roles";

export async function validateManagementSession() {
  // Lebih simpel
  const session = await auth();

  if (!session?.user?.id) {
    throw unauthorized("You haven't logged in yet");
  }

  const teacherProfile = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    select: {
      userId: true,
      staffRole: true,
      user: {
        select: { name: true },
      },
    },
  });

  if (!teacherProfile) {
    throw notFound("Staff profile not found");
  }

  // Menggunakan nama variabel yang lebih deskriptif untuk hasil pengecekan
  const canAccess = hasManagementAccess(teacherProfile.staffRole);

  if (!canAccess) {
    throw forbidden("You're not allowed to access this");
  }

  return teacherProfile;
}
