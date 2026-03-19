import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";
import { resetPasswordSchema } from "@/lib/zod/auth";
import { resetPasswordService } from "@/services/auth/reset-password-service";

export async function POST(req: Request) {
  try {
    const rawData = await req.json();
    const data = resetPasswordSchema.parse(rawData);

    await resetPasswordService(data);

    return Response.json(
      {
        message: "Succesfully changed the password",
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "POST", "/api/auth/reset-password");
    return handleError(error);
  }
}
