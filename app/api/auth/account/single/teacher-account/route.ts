import { badRequest, handleError, internalServerError } from "@/lib/errors";
import { prisma } from "@/db/prisma";
import hashing from "@/lib/utils/hashing";
import { teacherSignUpSchema } from "@/lib/utils/zodSchema";
import { getFullClassLabel } from "@/lib/utils/labels";
import { validateStaffSession } from "@/lib/validation/guards";
import { validateTeachingStructure } from "@/lib/validation/teachingValidators";

type ResolvedTeachingAssignments = {
  teacherId: string;
  subjectId: number;
  academicYear: string;
  classId: number;
};

export async function POST(req: Request) {
  try {
    await validateStaffSession();

    const rawData = await req.json();

    const data = teacherSignUpSchema.parse(rawData);

    const existingTeacher = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingTeacher) {
      throw badRequest("Email already registered");
    }

    const hashedPassword = await hashing(data.passwordSchema.password);

    await prisma.$transaction(async (tx) => {
      // create teacher account
      const teacher = await tx.user.create({
        data: {
          role: "STAFF",
          name: data.username,
          email: data.email,
          password: hashedPassword,

          teacherProfile: {
            create: {
              staffRole: "TEACHER",
            },
          },
        },
        select: {
          name: true,
          email: true,
          id: true,
        },
      });

      let resolvedTeachingAssignments: ResolvedTeachingAssignments[] = [];

      if (Array.isArray(data.assignments) && data.assignments.length > 0) {
        /* VALIDATION: 
          - Check for duplicate assignments (same subject in same class)
        */
        validateTeachingStructure(data.assignments);

        // Resolve classroom IDs and validate existence for each assignment
        resolvedTeachingAssignments = await Promise.all(
          data.assignments.map(async (assignment) => {
            const classroom = await tx.classroom.findUnique({
              where: {
                grade_major_section: {
                  grade: assignment.grade,
                  major: assignment.major,
                  section: assignment.section,
                },
              },
              select: { id: true },
            });

            // Validate is classroom found
            if (!classroom) {
              throw badRequest(
                `Assignment Error (${assignment.subjectName}): Class ${getFullClassLabel(
                  assignment.grade,
                  assignment.major,
                  assignment.section,
                )}does not exist.`,
              );
            }

            const findSubject = await tx.subject.findUnique({
              where: {
                id: assignment.subjectId,
              },
              select: {
                config: {
                  select: {
                    allowedGrades: true,
                    allowedMajors: true,
                  },
                },
              },
            });

            if (!findSubject) {
              throw badRequest("Subject was not found");
            }

            const isGradeInclude = findSubject.config.allowedGrades.includes(
              assignment.grade,
            );

            const isMajorInclude = findSubject.config.allowedMajors.includes(
              assignment.major,
            );

            if (!(isGradeInclude && isMajorInclude)) {
              throw badRequest(`${assignment.subjectName}: Config miss match`);
            }

            return {
              teacherId: teacher.id,
              subjectId: assignment.subjectId,
              academicYear: String(new Date().getFullYear()),
              classId: classroom.id,
            };
          }),
        );
      }

      // Create many teaching assignments
      if (resolvedTeachingAssignments?.length)
        await tx.teachingAssignment.createMany({
          data: resolvedTeachingAssignments,
          skipDuplicates: true,
        });

      // Handle homeroom class
      if (data.homeroomClass?.grade && data.homeroomClass.major) {
        const existingHomeroomClass = await tx.classroom.findUnique({
          where: {
            grade_major_section: {
              grade: data.homeroomClass.grade,
              major: data.homeroomClass.major,
              section: data.homeroomClass.section,
            },
          },
        });

        if (existingHomeroomClass) {
          const classLabel = getFullClassLabel(
            data.homeroomClass.grade,
            data.homeroomClass.major,
            data.homeroomClass.section,
          );

          throw badRequest(
            `There is already a homeroom teacher in ${classLabel}`,
          );
        }

        await tx.classroom.create({
          data: {
            grade: data.homeroomClass.grade,
            major: data.homeroomClass.major,
            section: data.homeroomClass.section,
            homeroomTeacherId: teacher.id,
          },
        });
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
