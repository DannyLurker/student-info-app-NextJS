import crypto from "crypto";

export function hashResetToken(token: string): string {
  return crypto
    .createHmac("sha256", process.env.RESET_TOKEN_SECRET!)
    .update(token)
    .digest("hex");
}
