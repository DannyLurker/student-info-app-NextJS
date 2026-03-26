import { validateStudentSession } from "@/domain/auth/role-guards";
import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";
import { getStudentAssessmentScoreSchema } from "@/lib/zod/assessment";
import { getStudentAssessmentScore } from "@/services/student/student-service";

export async function GET(req: Request) {
  try {
    const studentSession = await validateStudentSession();

    const { searchParams } = new URL(req.url);

    const rawData = Object.fromEntries(searchParams.entries());

    const data = getStudentAssessmentScoreSchema.parse(rawData);

    const response = await getStudentAssessmentScore(data, studentSession);

    return Response.json(
      {
        message: "Successfully retrieved assessment score data",
        assessmentScores: response.assessmentScores,
        totalRecords: response.totalRecords,
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "GET", "/api/student/assessment-score");
    return handleError(error);
  }
}
