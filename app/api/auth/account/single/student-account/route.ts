import { badRequest, handleError, notFound } from "@/lib/errors";
import { prisma } from "@/db/prisma";
import hashing from "@/lib/utils/hashing";
import {
  StudentSignUpSchema,
  studentSignUpSchema,
} from "@/lib/utils/zodSchema";
import crypto from "crypto";
import { getSemester } from "@/lib/utils/date";
import { ClassSection, Grade, Semester } from "@/lib/constants/class";
import { validateStaffSession } from "@/lib/validation/guards";
import { Major } from "@/db/prisma/src/generated/prisma/enums";

export async function POST(req: Request) {
  try {
    await validateStaffSession();

    const rawData: StudentSignUpSchema = await req.json();

    const data = studentSignUpSchema.parse(rawData);

    let parentAccount: {
      email: string;
      password: string;
    } = {
      email: "",
      password: "",
    };

    const existingSubjects = await prisma.subject.findMany({
      where: {
        config: {
          allowedGrades: {
            has: data.classSchema.grade,
          },
          allowedMajors: {
            has: data.classSchema.major,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (existingSubjects.length === 0) {
      throw badRequest(
        "No subjects found for this grade and major. Please configure subjects first.",
      );
    }

    await prisma.$transaction(async (tx) => {
      const existingStudent = await tx.user.findUnique({
        where: { email: data.email },
      });

      if (existingStudent) {
        throw badRequest("Email already registered");
      }

      const hashedPassword = await hashing(data.passwordSchema.password);

      const classroom = await tx.classroom.upsert({
        where: {
          grade_major_section: {
            grade: data.classSchema.grade as Grade,
            major: data.classSchema.major as Major,
            section: data.classSchema.section as ClassSection,
          },
        },
        update: {},
        create: {
          grade: data.classSchema.grade,
          major: data.classSchema.major,
          section: data.classSchema.section,
        },
        select: {
          id: true,
        },
      });

      if (!classroom) {
        throw notFound("Classroom not found");
      }

      const student = await tx.user.create({
        data: {
          name: data.username,
          email: data.email,
          password: hashedPassword,
          role: "STUDENT",
          studentProfile: {
            create: {
              classId: classroom.id,
              studentRole: data.studentRole,
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const today = new Date();
      // We only have 2 semsesters. In DB we describe as "FIRST" and "SECOND"
      const currentSemester = getSemester(today) === 1 ? "FIRST" : "SECOND";

      const gradebookRecords = await Promise.all(
        existingSubjects.map(async (subject) => {
          return {
            studentId: student.id,
            subjectId: subject.id,
            academicYear: String(new Date().getFullYear()),
            semester: currentSemester as Semester,
          };
        }),
      );

      await tx.gradebook.createMany({
        data: gradebookRecords,
      });

      const rawRandomPassword = crypto.randomBytes(8).toString("hex");
      const hashRandomPassword = await hashing(rawRandomPassword);

      const parentAccountEmail = `${student.name.trim().toLowerCase().replaceAll(" ", "")}${student.id.slice(0, 4)}parentaccount@gmail.com`;

      await tx.user.create({
        data: {
          email: parentAccountEmail,
          name: `${student.name}'s Parents`,
          password: hashRandomPassword,
          role: "PARENT",
          parentProfile: {
            create: {
              studentId: student.id,
            },
          },
        },
        select: {
          role: true,
        },
      });

      parentAccount = {
        email: parentAccountEmail,
        password: rawRandomPassword,
      };
    });

    return Response.json(
      {
        message: "Student account created successfully",
        data: {
          parentAccount: parentAccount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/auth/account/single/student-account",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
