import {
  IP_RATE_LIMIT,
  IP_RATE_LIMIT_TTL,
  OTP_RATE_LIMIT,
  OTP_RATE_LIMIT_TTL,
} from "@/lib/constants/rate-limiter";
import { tooManyRequest } from "@/lib/errors";
import redis from "@/lib/redis";

export async function assertForgotPasswordIpLimit(ip: string) {
  const ipRateKey = `rate:ip:${ip}`;

  const ipRequestCount = await redis.incr(ipRateKey);

  if (ipRequestCount === 1) {
    await redis.expire(ipRateKey, IP_RATE_LIMIT_TTL);
  }

  if (ipRequestCount > IP_RATE_LIMIT) {
    throw tooManyRequest(
      "Requested OTP too many times. Please try again later.",
    );
  }
}

export async function assertOtpRequestLimit(userId: string) {
  const otpRateKey = `rate:otp:${userId}`;

  const otpRequestCount = await redis.incr(otpRateKey);

  // Set TTL only for first request
  if (otpRequestCount === 1) {
    await redis.expire(otpRateKey, OTP_RATE_LIMIT_TTL);
  }

  if (otpRequestCount > OTP_RATE_LIMIT) {
    throw tooManyRequest(
      "Requested OTP too many times. Please try again later.",
    );
  }

  const cooldownKey = `cooldown:reset:${userId}`;
  const lastReset = await redis.get(cooldownKey);

  if (lastReset) {
    throw tooManyRequest(
      "Too many password reset attempts. Please try again later.",
    );
  }
}
