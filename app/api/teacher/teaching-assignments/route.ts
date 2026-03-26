import { validateTeacherSession } from "@/domain/auth/role-guards";
import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";
import { getTeachingAssignments } from "@/services/teaching-assignment/teaching-assignment-service";

export async function GET() {
  try {
    const teacherSession = await validateTeacherSession();

    const response = await getTeachingAssignments(teacherSession.userId);

    return Response.json(
      {
        message: "Successfully retrieved teaching assignments data",
        teachingAssignments: response.teachingAssignments,
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "GET", "/api/teacher/teaching-assignment");
    return handleError(error);
  }
}
