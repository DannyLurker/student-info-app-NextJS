import { badRequest, handleError } from "@/lib/errors";
import { prisma } from "@/prisma/prisma";
import hashing from "@/lib/utils/hashing";
import {
  zodTeacherSignUp,
  zodTeacherSignUpSchema,
} from "@/lib/utils/zodSchema";

export async function POST(req: Request) {
  try {
    const data: zodTeacherSignUpSchema = await req.json();

    zodTeacherSignUp.parse(data);

    if (data.password !== data.confirmPassword) {
      throw badRequest("Password and confirm password must be the same");
    }

    const existingTeacher = await prisma.student.findUnique({
      where: { email: data.email },
    });

    if (existingTeacher) {
      throw badRequest("Email already registered");
    }

    const hashedPassword = await hashing(data.password);

    if (!data.homeroomClass?.grade || !data.homeroomClass.major) {
      throw badRequest("All field must be filled");
    }

    const user = await prisma.teacher.create({
      data: {
        role: "teacher",
        name: data.username,
        email: data.email,
        password: hashedPassword,

        homeroomClass: {
          create: {
            grade: data.homeroomClass.grade,
            major: data.homeroomClass.major,
            classNumber: data.homeroomClass.classNumber ?? null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    let teachingClasses;

    if (
      !Array.isArray(data.teachingClasses) ||
      data.teachingClasses?.length != 0
    ) {
      console.log("BELUM SELESAI");
    }

    return Response.json(
      {
        message: "Successfully signed up",
        data: { user },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
