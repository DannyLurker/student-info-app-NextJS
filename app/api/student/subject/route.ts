import { validateStudentSession } from "@/domain/auth/role-guards";
import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";
import { getStudentSubject } from "@/services/student/student-service";

export async function GET() {
  try {
    const studentSession = await validateStudentSession();

    const response = await getStudentSubject(studentSession);

    return Response.json(
      {
        message: "Successfully retrieved subject data",
        subjects: response.subjects,
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "GET", "/api/student/subject");
    return handleError(error);
  }
}
