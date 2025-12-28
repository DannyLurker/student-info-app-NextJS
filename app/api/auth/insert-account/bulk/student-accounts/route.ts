import { badRequest, handleError, notFound } from "@/lib/errors";
import { prisma } from "@/prisma/prisma";
import hashing from "@/lib/utils/hashing";
import { subjects } from "@/lib/utils/subjects";
import * as XLSX from "xlsx";
import { Grade, GRADES, Major, MAJORS } from "@/lib/constants/class";
interface StudentRow {
  username: string;
  email: string;
  password: string;
  grade: Grade;
  major: Major;
  classNumber?: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw badRequest("No file uploaded");
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet) as StudentRow[];

    if (data.length === 0) {
      throw badRequest("Excel file is empty");
    }

    // Process each student
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // +2 because Excel rows start at 1 and we have header

        // Validate required fields
        if (
          !row.username ||
          !row.email ||
          !row.password ||
          !row.grade ||
          !row.major
        ) {
          throw badRequest(`Row ${rowNumber}: Missing required fields`);
        }

        //Validate grade and major type
        if (!GRADES.includes(row.grade as Grade)) {
          throw badRequest(`Row ${rowNumber}: Invalid grade format`);
        }

        if (!MAJORS.includes(row.major as Major)) {
          throw badRequest(`Row ${rowNumber}: Invalid major format`);
        }

        // Check if student already exists
        const existingStudent = await tx.student.findUnique({
          where: { email: row.email },
        });

        if (existingStudent) {
          throw badRequest(`Row ${rowNumber}: Email already registered`);
        }

        // Hash password
        const hashedPassword = await hashing(row.password);

        // Find homeroom class
        const homeroomClass = await tx.homeroomClass.findFirst({
          where: {
            grade: row.grade,
            major: row.major,
            classNumber: row.classNumber,
          },
          select: {
            teacherId: true,
          },
        });

        if (!homeroomClass) {
          throw badRequest(`Row ${rowNumber}: Homeroom class not found`);
        }

        // Create student
        const student = await tx.student.create({
          data: {
            name: row.username,
            email: row.email,
            password: hashedPassword,
            grade: row.grade,
            major: row.major,
            classNumber: row.classNumber as string,
            isVerified: true,
            homeroomTeacherId: homeroomClass.teacherId,
          },
          select: {
            id: true,
          },
        });

        // Get subject list
        const subjectsList = subjects[row.grade]?.major?.[row.major] ?? [];

        if (subjectsList.length === 0) {
          throw badRequest(`Row ${rowNumber}: Subject configuration not found`);
        }

        // Upsert subjects
        const subjectRecords = await Promise.all(
          subjectsList.map(async (subjectName) => {
            return await tx.subject.upsert({
              where: { subjectName },
              update: {},
              create: { subjectName },
            });
          })
        );

        // Connect subjects to student
        await tx.student.update({
          where: { id: student.id },
          data: {
            studentSubjects: {
              connect: subjectRecords.map((s) => ({ id: s.id })),
            },
          },
        });
      }
    });

    return Response.json(
      {
        message: `Bulk import completed`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error bulk creating students:", error);
    return handleError(error);
  }
}
