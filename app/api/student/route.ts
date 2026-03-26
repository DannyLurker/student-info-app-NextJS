import { validateLoginSession } from "@/domain/auth/role-guards";
import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";
import { studentQuerySchema } from "@/lib/zod/student";
import { getStudents } from "@/services/student/student-service";

export async function GET(req: Request) {
  try {
    await validateLoginSession();

    const { searchParams } = new URL(req.url);

    const rawData = Object.fromEntries(searchParams.entries());

    const data = studentQuerySchema.parse(rawData);

    const response = await getStudents(data);

    return Response.json(
      {
        message: "Successfully retrieved list of students",
        data: { students: response.students },
        totalStudents: response.totalStudents,
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "GET", "/api/student");
    return handleError(error);
  }
}
