import { deleteTeacher } from "@/features/teacher/server/services/teacher-service";
import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
