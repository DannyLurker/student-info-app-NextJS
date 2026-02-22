import { handleError, notFound } from "../../../../../lib/errors";
import { updateAssessmentScoresSchema } from "../../../../../lib/utils/zodSchema";
import { prisma } from "@/db/prisma";
import { validateTeacherSession } from "../../../../../lib/validation/guards";
import { Prisma } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const teacherSession = await validateTeacherSession();

    const rawData = await req.json();
    const data = updateAssessmentScoresSchema.parse(rawData);

    const teachingAssignment = await prisma.teachingAssignment.findUnique({
      where: {
        teacherId_subjectId_classId: {
          teacherId: teacherSession.userId,
          subjectId: data.subjectId,
          classId: data.classId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!teachingAssignment) throw notFound("Teaching assignment not found");

    await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Flatten the nested data into a linear array for easier processing within a single transaction.
        const updatePromises = data.students.flatMap((student) =>
          student.studentAssessments.map((assessment) => {
            return tx.assessmentScore.update({
              where: {
                id: assessment.assessmentScoreId,
                studentId: student.studentId,
              },
              data: {
                score: assessment.score,
              },
            });
          }),
        );

        await Promise.all(updatePromises);
      },
      {
        timeout: 15000,
      },
    );

    return Response.json(
      { message: "Successfully updated students' marks" },
      { status: 201 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(PATCH) /api/teacher/student-assessment/grading",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
