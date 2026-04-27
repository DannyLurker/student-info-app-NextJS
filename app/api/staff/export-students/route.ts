import { inngest } from "@/inngest/client";
import { getStudentExportSchema } from "@/lib/zod/student";
import { validateManagementSession } from "@/domain/auth/role-guards";
import { printConsoleError } from "@/lib/utils/printError";
import { handleError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const session = await validateManagementSession();
    const body = await req.json();
    const data = getStudentExportSchema.parse(body);

    // Trigger the Inngest function
    await inngest.send({
      name: "app/students.export.requested",
      data: {
        payload: data,
        userEmail: session.user.email,
        username: session.user.name,
      },
    });

    return Response.json(
      {
        message: "Export started. You will receive an email shortly.",
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "POST", "/api/staff/export-students");
    return handleError(error);
  }
}
