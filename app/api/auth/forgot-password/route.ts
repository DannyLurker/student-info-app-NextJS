import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";
import { forgotPasswordSchema } from "@/lib/zod/auth";
import { forgotPassword } from "@/services/auth/forgot-password-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = forgotPasswordSchema.parse(body);

    await forgotPassword(data);

    return Response.json(
      { message: "If the email exists, an OTP has been sent." },
      { status: 201 },
    );
  } catch (error) {
    printConsoleError(error, "POST", "/api/auth/forgot-password");
    return handleError(error);
  }
}
