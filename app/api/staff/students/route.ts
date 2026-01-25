import { badRequest, handleError, notFound } from "@/lib/errors";
import { classParams } from "@/lib/utils/zodSchema";
import { prisma } from "@/db/prisma";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const staffIdParam = searchParams.get("staffId");

    const data = classParams.parse({
      grade: searchParams.get("grade"),
      major: searchParams.get("major"),
      classNumber: searchParams.get("classNumber"),
    });

    if (!staffIdParam) {
      throw badRequest("Staff id is missing");
    }

    const studentRecords = await prisma.student.findMany({
      where: {
        grade: data.grade,
        major: data.major,
        classNumber: data.classNumber,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (studentRecords.length === 0) {
      throw notFound("Student not found");
    }

    const studentsWorksheet = XLSX.utils.json_to_sheet(studentRecords);
    const studentWorkbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      studentWorkbook,
      studentsWorksheet,
      "Student Data"
    );

    const studentBuffer = XLSX.write(studentWorkbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new Response(studentBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Student-Data.xlsx",
      },
    });
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/student",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
