import { handleError } from "@/lib/errors";
import { printConsoleError } from "@/lib/utils/printError";
import { validateManagementSession } from "@/lib/validation/guards";
import {
  createSubjectSchema,
  getSubjectQueriesSchema,
  patchSubjectSchema,
} from "@/lib/zod/subject";
import {
  createSubject,
  deleteSubject,
  getSubject,
  updateSubject,
} from "@/services/subject/subject-services";

export async function POST(req: Request) {
  try {
    await validateManagementSession();

    const rawData = await req.json();

    const data = createSubjectSchema.parse(rawData);

    const response = await createSubject(data);

    return Response.json(
      {
        message: "Successfully created new subject",
        details: `Created ${response.totalNewSubjects} new subjects.`,
      },

      { status: 201 },
    );
  } catch (error) {
    printConsoleError(error, "POST", "/api/staff/subject");
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    await validateManagementSession();

    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const data = getSubjectQueriesSchema.parse(rawParams);

    const response = await getSubject(data);

    return Response.json(
      {
        message: "Successfully retrieved subjects data",
        subjects: response.formattedSubjects,
        totalSubject: response.totalSubject,
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "GET", "/api/staff/subject");
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await validateManagementSession();

    const { searchParams } = new URL(req.url);
    const subjectId = Number(searchParams.get("subjectId"));

    await deleteSubject(subjectId);

    return Response.json(
      { message: "Subject deleted Successfully" },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "DELETE", "/api/staff/subject");
    handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    validateManagementSession();
    const rawData = await req.json();
    const data = patchSubjectSchema.parse(rawData);

    await updateSubject(data);

    return Response.json(
      { message: "Successfully updated subject data" },
      { status: 201 },
    );
  } catch (error) {
    printConsoleError(error, "PATCH", "/api/staff/subject");
    return handleError(error);
  }
}
