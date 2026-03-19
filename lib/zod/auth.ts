import { z } from "zod";
import { passwordSchema } from "./general";

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please input a correct format" }),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  otp: z.string({ message: "Must be filled" }),
  token: z.string({ message: "Must be filled" }),
  passwordSchema,
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
