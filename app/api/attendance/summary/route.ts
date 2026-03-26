import { printConsoleError } from "@/lib/utils/printError";
import { handleError } from "../../../../lib/errors";
import { attendanceSummaryQueries } from "@/lib/zod/attendance";
import { getAttendanceSumamry } from "@/services/attendance/attendance-service";
import { validateHomeroomTeacherSession } from "@/domain/auth/role-guards";

export async function GET(req: Request) {
  try {
    const homeroomTeacherSession = await validateHomeroomTeacherSession();

    const { searchParams } = new URL(req.url);

    const rawParams = Object.fromEntries(searchParams.entries());

    const data = attendanceSummaryQueries.parse(rawParams);

    const result = await getAttendanceSumamry(data, homeroomTeacherSession);

    return Response.json(
      {
        message: "Successfully retrieved students' attendance summary",
        class: {
          grade: homeroomTeacherSession.homeroom?.grade,
          major: homeroomTeacherSession.homeroom?.major,
          classNumber: homeroomTeacherSession.homeroom?.section,
        },
        students: result.studentAttendanceSummaries,
        totalStudents: result.totalStudents,
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "GET", "/api/student/attendance/summary");
    return handleError(error);
  }
}
