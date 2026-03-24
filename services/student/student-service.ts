import { prisma } from "@/db/prisma";
import { notFound } from "@/lib/errors";
import { GetStudentExportSchema } from "@/lib/zod/student";
import { findUniqueClassroom } from "@/repositories/classroom-repository";
import { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";

export const getStudentExport = async (data: GetStudentExportSchema) => {
  const classroomByUniqueIdentifier =
    Prisma.validator<Prisma.ClassroomWhereUniqueInput>()({
      grade_major_section: {
        grade: data.grade,
        major: data.major,
        section: data.section,
      },
    });

  const selectClassroomWithStudents =
    Prisma.validator<Prisma.ClassroomSelect>()({
      students: {
        select: {
          user: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    });

  const studentRecords = await findUniqueClassroom(
    classroomByUniqueIdentifier,
    selectClassroomWithStudents,
    prisma,
  );

  if (studentRecords?.students.length === 0) {
    throw notFound("Student not found");
  }

  const studentsWorksheet = XLSX.utils.json_to_sheet(
    studentRecords?.students.map(
      (student: { user: { id: string; name: string } }) => student.user,
    ) as [],
  );
  const studentWorkbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    studentWorkbook,
    studentsWorksheet,
    "Student Data",
  );

  const studentBuffer = XLSX.write(studentWorkbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return {
    studentBuffer,
  };
};
