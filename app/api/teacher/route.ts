import { prisma } from "@/db/prisma";
import { TEACHER_FETCH_TYPE, TeacherFetchType } from "@/lib/constants/teacher";
import { badRequest, handleError } from "@/lib/errors";
import { validateManagementSession } from "@/lib/validation/guards";

export async function GET(req: Request) {
  try {
    validateManagementSession();

    const { searchParams } = new URL(req.url);
    /**
     * Fetches teachers based on homeroom status.
     * @query get - 'all' to fetch every teachers, 'nonHomeroom' for teachers that aren't homeroom teacher only.
     */
    const teacherGetType = searchParams.get("get");

    if (!TEACHER_FETCH_TYPE.includes(teacherGetType as any)) {
      throw badRequest("Invalid fetch type. Use 'all' or 'nonHomeroom'.");
    }

    const whereCondition: any = {
      staffRole: "TEACHER",
    };

    if ((teacherGetType as TeacherFetchType) === "nonHomeroom") {
      whereCondition.homeroom = null;
    }

    const teachers = await prisma.teacher.findMany({
      where: whereCondition,
      select: {
        homeroom: {
          select: { id: true },
        },
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return Response.json({
      message: "Teachers data retrieved successfully",
      data: teachers ?? [],
    });
  } catch (error) {
    console.error("API_ERROR", {
      route: "(GET) /api/teacher",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
