import { badRequest, handleError, internalServerError } from "@/lib/errors";
import { prisma } from "@/db/prisma";
import hashing from "@/lib/utils/hashing";
import { teacherSignUpSchema } from "@/lib/utils/zodSchema";
import { getFullClassLabel } from "@/lib/utils/labels";
import { validateTeachingStructure } from "@/lib/validation/teachingValidators";
import { ClassNumber, Grade, Major } from "@/lib/constants/class";
import { validateStaffSession } from "@/lib/validation/guards";

export async function POST(req: Request) {
  try {
    await validateStaffSession();

    const rawData = await req.json();

    const data = teacherSignUpSchema.parse(rawData);

    const existingTeacher = await prisma.teacher.findUnique({
      where: { email: data.email },
    });

    if (existingTeacher) {
      throw badRequest("Email already registered");
    }

    const hashedPassword = await hashing(data.passwordSchema.password);

    await prisma.$transaction(async (tx) => {
      if (
        Array.isArray(data.teachingClasses) &&
        data.teachingClasses.length > 0 &&
        Array.isArray(data.teachingAssignment) &&
        data.teachingAssignment.length > 0
      ) {
        /* VALIDATION 2: 
          - Check if every teaching class matches one of the teaching assignments
          - Check if every teaching assignment matches one of the teaching classes
          - Check if the subject is valid for that specific class
          - Check for duplicate assignments (same subject in same class)
        */
        validateTeachingStructure(
          data.teachingClasses,
          data.teachingAssignment,
        );

        const assignmentStrings = data.teachingAssignment.map(
          (ta) => `${ta.grade}-${ta.major}-${ta.classNumber}-${ta.subjectName}`,
        );

        // for create or connect teaching classes data to teacher account
        const teachingClassesData = data.teachingClasses.map((tc) => ({
          where: {
            grade_major_classNumber: {
              grade: tc.grade,
              major: tc.major,
              classNumber: tc.classNumber,
            },
          },
          create: {
            grade: tc.grade,
            major: tc.major,
            classNumber: tc.classNumber,
          },
        }));

        // Handle Teaching Assignments
        const subjects = await Promise.all(
          data.teachingAssignment.map(async (assignment) => {
            return await tx.subject.upsert({
              where: {
                subjectName: assignment.subjectName,
              },
              update: {},
              create: { subjectName: assignment.subjectName },
            });
          }),
        );

        const subjectMap = new Map(subjects.map((s) => [s.subjectName, s.id]));

        const assignmentUniqueKeys = new Set(assignmentStrings);

        const filteredAssignments = Array.from(assignmentUniqueKeys);

        const teachingAssignmentData = filteredAssignments.map((assignment) => {
          const [grade, major, classNumber, subjectName] =
            assignment.split("-");

          const subjectId = subjectMap.get(subjectName);

          if (!subjectId) {
            throw internalServerError("Subject mapping failed");
          }

          return {
            where: {
              subjectId_grade_major_classNumber: {
                subjectId: subjectId,
                grade: grade as Grade,
                major: major as Major,
                classNumber: classNumber as ClassNumber,
              },
            },
            create: {
              subjectId: subjectId,
              grade: grade as Grade,
              major: major as Major,
              classNumber: classNumber as ClassNumber,
            },
          };
        });

        // create teacher account
        const teacher = await tx.teacher.create({
          data: {
            role: "TEACHER",
            name: data.username,
            email: data.email,
            password: hashedPassword,

            teachingClasses: {
              connectOrCreate: teachingClassesData,
            },

            teachingAssignments: {
              connectOrCreate: teachingAssignmentData,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        // Handle homeroom class
        if (data.homeroomClass?.grade && data.homeroomClass.major) {
          const existingHomeroomClass = await tx.homeroomClass.findUnique({
            where: {
              grade_major_classNumber: {
                grade: data.homeroomClass.grade,
                major: data.homeroomClass.major,
                classNumber: data.homeroomClass.classNumber,
              },
            },
          });

          if (existingHomeroomClass) {
            const classLabel = getFullClassLabel(
              data.homeroomClass.grade,
              data.homeroomClass.major,
              data.homeroomClass.classNumber,
            );

            throw badRequest(
              `There is already a homeroom teacher in ${classLabel}`,
            );
          }

          await tx.homeroomClass.create({
            data: {
              grade: data.homeroomClass.grade,
              major: data.homeroomClass.major,
              classNumber: data.homeroomClass.classNumber,
              teacherId: teacher.id,
            },
          });
        }
      }
    });

    return Response.json(
      {
        message: "Successfully created teacher account",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/auth/account/single/teacher-account",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
