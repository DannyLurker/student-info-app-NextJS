import { prisma } from "@/db/prisma";
import { badRequest, handleError } from "../../../../../../lib/errors";
import { updateTeacherProfileSchema } from "../../../../../../lib/utils/zodSchema";
import { validateManagementSession } from "../../../../../../lib/validation/guards";

export async function PATCH(req: Request) {
  try {
    await validateManagementSession();

    const rawData = await req.json();

    const data = updateTeacherProfileSchema.parse(rawData);

    const classroomIds = await prisma.classroom.findMany({
      select: { id: true },
    });
    const teachingAssignments = await prisma.teachingAssignment.findMany({
      select: { subjectId: true, classId: true },
    });

    const transformClassroomIds: number[] = classroomIds.map(
      (classroom) => classroom.id,
    );
    const transformTeachingAssignments = teachingAssignments.map(
      (teachingAssignment) => ({
        subjectId: teachingAssignment.subjectId,
        classId: teachingAssignment.classId,
      }),
    );

    /* 
        Validation:
        1. Make sure there is a classroom
        2. Make sure the teaching assignment isn't duplicate
    */
    data.teachingAssignments.map((assignment, index) => {
      if (!transformClassroomIds.includes(assignment.classId)) {
        throw badRequest(
          `Teaching assignment row-${index + 1}: Classroom not found`,
        );
      }

      const isDuplicated = transformTeachingAssignments.find(
        (teachingAssignment) =>
          teachingAssignment.classId === assignment.classId &&
          teachingAssignment.subjectId === assignment.subjectId,
      );

      if (isDuplicated) {
        throw badRequest(
          `Teaching assignment row-${index + 1}: A teacher is already assigned to this subject and class.`,
        );
      }
    });

    await prisma.teacher.update({
      where: {
        userId: data.id,
      },
      data: {
        user: {
          update: {
            name: data.name,
          },
        },
      },
    });

    Promise.all([
      data.teachingAssignments.map(async (assignment) => {
        await prisma.teachingAssignment.update({
          where: {
            id: assignment.assignmentId,
          },
          data: {
            subjectId: assignment.subjectId,
            teacherId: data.id,
            classId: assignment.classId,
          },
        });
      }),
    ]);

    return Response.json(
      { message: "Teacher profile updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "(PATCH) /api/staff/edit-user/single/teacher",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
