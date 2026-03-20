import { prisma } from "@/db/prisma";
import { PASSWORD_RESET_COOLDOWN } from "@/lib/constants/rate-limiter";
import { badRequest } from "@/lib/errors";
import redis from "@/lib/redis";
import hashing from "@/lib/utils/hashing";
import { hashResetToken } from "@/lib/utils/hashToken";
import { ResetPasswordSchema } from "@/lib/zod/auth";
import bcrypt from "bcryptjs";

export async function resetPassword(data: ResetPasswordSchema) {
  const resetData = await redis.get(`reset:${hashResetToken(data.token)}`);

  if (!resetData) {
    throw badRequest("Invalid or expired reset token");
  }

  const { userId, otpHash } = JSON.parse(resetData);

  const isOtpValid = await bcrypt.compare(data.otp, otpHash);

  if (!isOtpValid) {
    throw badRequest("Invalid or expired OTP code");
  }

  const hashedPassword = await hashing(data.passwordSchema.password);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  await redis.set(`cooldown:reset:${userId}`, "1", {
    EX: PASSWORD_RESET_COOLDOWN,
  });

  await redis.del(`rate:otp:${userId}`);
  await redis.del(`reset:${hashResetToken(data.token)}`);
}
