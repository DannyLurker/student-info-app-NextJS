import { badRequest, handleError } from "@/lib/errors";
import {
  StudentSession,
  validateStudentSession,
} from "@/domain/auth/role-guards";
import { getStudentProfile } from "@/services/student/student-service";
import { printConsoleError } from "@/lib/utils/printError";

export async function GET(req: Request) {
  try {
    let studentSession: StudentSession | null = null;

    try {
      studentSession = await validateStudentSession();
    } catch {}

    const { searchParams } = new URL(req.url);

    const studentId = searchParams.get("studentId");

    if (!studentId && !studentSession) {
      throw badRequest("Student id is missing");
    }

    const response = await getStudentProfile(studentSession, studentId);

    return Response.json(
      {
        mesasge: "Successfully retrieved student attendance stats",
        data: {
          attendanceRecords: response.attendanceRecords,
          demeritPointRecords: response.demeritPointRecords,
          totalSubject: response.totalSubjects,
          studentProfile: response.studentProfile,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "GET", "/api/student/profile");
    return handleError(error);
  }
}
