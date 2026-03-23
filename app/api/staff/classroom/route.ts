import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";
import { validateManagementSession } from "@/lib/validation/guards";
import { createClassSchema, updateClassSchema } from "@/lib/zod/classroom";
import {
  createClassroom,
  deleteClassroom,
  getClassroom,
  updateClassroom,
} from "@/services/classroom/classroom-service";

export async function GET() {
  try {
    validateManagementSession();

    const response = await getClassroom();

    return Response.json(
      {
        data: response.classroomData,
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "GET", "/api/staff/classroom");
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    validateManagementSession();

    const rawData = await req.json();

    // from frontend
    const data = createClassSchema.parse(rawData);

    await createClassroom(data);

    return Response.json(
      { message: "Classrooms created successfully" },
      { status: 201 },
    );
  } catch (error) {
    printConsoleError(error, "POST", "/api/staff/classroom");
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    validateManagementSession();

    const rawData = await req.json();

    const data = updateClassSchema.parse(rawData);

    await updateClassroom(data);

    return Response.json(
      { message: "data successfully updated" },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "PATCH", "/api/staff/classroom");
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    validateManagementSession();

    const { searchParams } = new URL(req.url);

    const classIdParam = Number(searchParams.get("classId"));

    await deleteClassroom(classIdParam);

    return Response.json(
      { message: `Classroom deleted successfully` },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "DELETE", "/api/staff/classroom");
    return handleError(error);
  }
}
