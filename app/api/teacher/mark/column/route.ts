import { badRequest, handleError, notFound } from "@/lib/errors";
import { getAcademicYear } from "@/lib/utils/date";
import { getFullClassLabel } from "@/lib/utils/labels";
import { createMarkColumnSchema } from "@/lib/utils/zodSchema";
import { prisma } from "@/db/prisma";
import { validateTeacherSession } from "@/lib/validation/guards";
import { AssessmentScoreCreateManyInput } from "@/db/prisma/src/generated/prisma/models";
import { ClassSection, Grade, Major } from "@/lib/constants/class";

export async function POST(req: Request) {
  try {
    const teacherSession = await validateTeacherSession();

    console.log(teacherSession);

    const rawData = await req.json();
    const data = createMarkColumnSchema.parse(rawData);

    const studentRecords = await prisma.student.findMany({
      where: {
        class: {
          grade: data.class.grade,
          major: data.class.major,
          section: data.class.section,
        },
      },
      select: {
        classId: true,
        user: {
          select: {
            id: true,
          },
        },
        gradebooks: {
          where: {
            subjectId: data.subjectId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (studentRecords.length === 0) {
      throw notFound("Student data not found");
    }

    const teachingAssignment = await prisma.teachingAssignment.findUnique({
      where: {
        teacherId_subjectId_classId_academicYear: {
          teacherId: teacherSession.userId,
          subjectId: data.subjectId,
          classId: studentRecords[0].classId as number,
          academicYear: getAcademicYear(),
        },
      },
      select: {
        id: true,
        totalAssignmentAssigned: true,
      },
    });

    console.log(teachingAssignment);

    if (!teachingAssignment) {
      throw badRequest("Teaching assignment not found");
    }

    const parseGivenAt = new Date(data.description.givenAt);
    const parseDueAt = new Date(data.description.dueAt);

    const assessment = await prisma.assessment.create({
      data: {
        assignmentId: teachingAssignment.id,
        title: data.description.title,
        givenAt: parseGivenAt,
        dueAt: parseDueAt,
        type: data.assessmentType,
      },
    });

    const assessmentScoresToCreate: AssessmentScoreCreateManyInput[] = [];

    for (const student of studentRecords) {
      assessmentScoresToCreate.push({
        gradebookId: student.gradebooks[0].id,
        teacherId: teacherSession.userId,
        assessmentId: assessment.id,
        studentId: student.user.id,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.teachingAssignment.update({
        where: {
          teacherId_subjectId_classId_academicYear: {
            classId: studentRecords[0].classId as number,
            teacherId: teacherSession.userId,
            subjectId: data.subjectId,
            academicYear: getAcademicYear(),
          },
        },
        data: {
          totalAssignmentAssigned: {
            increment: 1,
          },
        },
      });

      await tx.assessmentScore.createMany({
        data: assessmentScoresToCreate,
        skipDuplicates: true,
      });
    });

    const classLabel = getFullClassLabel(
      data.class.grade as Grade,
      data.class.major as Major,
      data.class.section as ClassSection,
    );

    return Response.json(
      {
        message: `Successfully created new assignment column for subject ${data.subjectName} in ${classLabel}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/teacher/mark/column",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}

export async function DELETE(req: Request) {}
