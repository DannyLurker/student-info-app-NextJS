import { createTeacherBulkAccount } from "@/services/teacher/create-teacher-bulk-account-service";
import { badRequest, handleError } from "../../../../../../lib/errors";
import { validateManagementSession } from "../../../../../../lib/validation/guards";
import { validateExcelExtension } from "@/domain/extension/extensionRules";
import { printConsoleError } from "@/lib/utils/printError";

export async function POST(req: Request) {
  try {
    await validateManagementSession();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw badRequest("No file uploaded");
    }

    validateExcelExtension(file);

    await createTeacherBulkAccount(file);

    return Response.json(
      { message: "Teacher accounts succesfully created" },
      { status: 201 },
    );
  } catch (error) {
    printConsoleError(error, "POST", "/api/auth/account/bulk/teacher-accounts");
    return handleError(error);
  }
}
