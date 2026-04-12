import { validateManagementSession } from "@/domain/auth/role-guards";
import {
  deleteTeacher,
  updateTeacher,
} from "@/features/teacher/server/services/teacher-service";
import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";
import { teacherUpdateSchema } from "@/lib/zod/teacher";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await validateManagementSession();

    const { id } = await params;

    await deleteTeacher(id);

    return Response.json(
      { message: "Teacher account deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "DELETE", "/api/staff/user/teacher/[id]");
    return handleError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await validateManagementSession();

    const { id } = await params;

    const rawData = await req.json();

    const data = teacherUpdateSchema.parse(rawData);

    const response = await updateTeacher(id, data);

    const message = response.isTeacherUpdated
      ? "Teacher updated successfully"
      : "No data was updated";

    return Response.json({ message }, { status: 200 });
  } catch (error) {
    printConsoleError(error, "PATCH", "/api/staff/user/teacher/[id]");
    return handleError(error);
  }
}
