import { badRequest, handleError, notFound } from "@/lib/errors";
import redis from "@/lib/redis";
import hashing from "@/lib/utils/hashing";
import { ResetPasswordSchema, zodResetPassword } from "@/lib/utils/zodSchema";
import { prisma } from "@/prisma/prisma";

export async function POST(req: Request) {
  try {
    const body: ResetPasswordSchema = await req.json();
    const data = zodResetPassword.parse(body);

    const userId = await redis.get(`otp:${data.otp}`);

    if (!userId) {
      throw badRequest("Invalid or expired OTP");
    }

    if (data.password !== data.confirmPassword) {
      throw badRequest("Password and confirm password must be the same");
    }

    const hashedPassword = await hashing(data.password);

    const updated = await prisma.student.updateMany({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    if (updated.count === 0) {
      await prisma.teacher.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    await redis.del(`otp:${data.otp}`);

    return Response.json(
      {
        message: "Succesfully changed the password",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error: ${error}`);
    return handleError(error);
  }
}
