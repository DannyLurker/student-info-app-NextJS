import { handleError, tooManyRequest } from "@/lib/errors";
import { zodForgotPassword } from "@/lib/utils/zodSchema";
import { prisma } from "@/prisma/prisma";
import redis from "@/lib/redis";
import { notFound } from "next/navigation";
import { loadTemplate, Replacements } from "@/lib/email/loadTemplate";
import { sendEmail } from "@/lib/email/nodeMailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = zodForgotPassword.parse(body);

    let user;

    user = await prisma.student.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      user = await prisma.teacher.findUnique({
        where: { email: data.email },
      });
    }

    if (!user) {
      throw notFound();
    }

    const RATE_LIMIT = 3;
    // TTL = Time To Live
    const RATE_LIMIT_TTL = 60 * 60;
    const OTP_TTL = 15 * 60;

    const rateKey = `rate:otp:${user.id}`;
    const otpKey = `otp:${user.id}`;

    const otpRequestCount = await redis.incr(rateKey);

    // Set TTL hanya saat request pertama
    if (otpRequestCount === 1) {
      await redis.expire(rateKey, RATE_LIMIT_TTL);
    }

    if (otpRequestCount > RATE_LIMIT) {
      throw tooManyRequest(
        "You have requested OTP too many times. Please try again later."
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(otpKey, otp, { EX: OTP_TTL });

    const replacements: Replacements = {
      schoolName: "SMK ADVENT",
      username: user.name,
      userEmail: user.email,
      otpCode: otp,
      currentYear: new Date().getFullYear(),
    };

    const htmlTemplate = loadTemplate("emailTemplate", replacements);

    await sendEmail({
      email: user.email,
      html: htmlTemplate,
      subject: "Reset Your Password - OTP Verification",
    });

    return Response.json(
      {
        message: "A new OTP is send to your email",
      },
      { status: 201 }
    );
  } catch (e) {
    handleError(e);
    console.error(e);
  }
}
