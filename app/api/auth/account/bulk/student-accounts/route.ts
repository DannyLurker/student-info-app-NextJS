import { badRequest, handleError } from "@/lib/errors";
import { prisma } from "@/db/prisma";
import hashing from "@/lib/utils/hashing";
import * as XLSX from "xlsx";
import { ClassSection, Grade, Major } from "@/lib/constants/class";
import crypto from "crypto";
import { getSemester } from "@/lib/utils/date";
import {
  ALLOWED_EXTENSIONS,
  AllowedExtensions,
} from "@/lib/constants/allowedExtensions";
import { validateManagementSession } from "@/lib/validation/guards";
import { createId } from "@paralleldrive/cuid2"; // Using cuid2 for pre-generating IDs
import {
  GradebookCreateManyInput,
  ParentCreateManyInput,
  StudentCreateManyInput,
  UserCreateManyInput,
} from "@/db/prisma/src/generated/prisma/models";
import { StudentPosition } from "@/lib/constants/roles";

type StudentExcelRow = {
  username: string;
  email: string;
  password: string;
  grade: Grade;
  major: Major;
  section: ClassSection;
  studentRole: StudentPosition;
};

export async function POST(req: Request) {
  try {
    await validateManagementSession();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) throw badRequest("No file uploaded");

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      !extension ||
      !ALLOWED_EXTENSIONS.includes(extension as AllowedExtensions)
    ) {
      throw badRequest("Please upload an Excel file (.xlsx or .xls)");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const data = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
    ) as StudentExcelRow[];

    if (data.length === 0) throw badRequest("Excel file is empty");

    // PRE-FETCH DATA FOR VALIDATION
    const excelEmails = data.map((row) => row.email).filter(Boolean);
    const [existingUsers, allClassrooms, allSubjects] = await Promise.all([
      prisma.user.findMany({
        where: { email: { in: excelEmails }, role: "STUDENT" },
        select: { email: true },
      }),
      prisma.classroom.findMany(),
      // Get subject config for filtering
      prisma.subject.findMany({
        include: { config: true },
      }),
    ]);

    const existingEmailSet = new Set(existingUsers.map((u) => u.email));
    const classroomMap = new Map(
      allClassrooms.map((c) => [`${c.grade}-${c.major}-${c.section}`, c.id]),
    );
    const subjectMap = new Map(allSubjects.map((s) => [s.name, s.id]));

    // PREPARE COLLECTIONS
    const usersToCreate: UserCreateManyInput[] = [];
    const studentProfilesToCreate: StudentCreateManyInput[] = [];
    const parentsToCreate: ParentCreateManyInput[] = [];
    const gradebooksToCreate: GradebookCreateManyInput[] = [];
    const parentAccountsForExcel: any[] = [];

    const academicYear = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
    const semester = getSemester(new Date()) === 1 ? "FIRST" : "SECOND";

    // Student Password
    const studentPasswordMap = new Map();
    const parentPasswordMap = new Map();

    await Promise.all(
      excelEmails.map(async (email, index) => {
        const rawParentPass = crypto.randomBytes(8).toString("hex");
        const hashedParentPass = await hashing(rawParentPass);

        if (data[index].email == email) {
          const password = await hashing(data[index].password);
          studentPasswordMap.set(email, password);
          parentPasswordMap.set(email, {
            rawParentPass: rawParentPass,
            hashedParentPass: hashedParentPass,
          });
        } else {
          throw badRequest(`Row ${index + 1}: There is an empty cell`);
        }
      }),
    );

    // VALIDATE AND MAP (IN-MEMORY)
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      const parentPassData = parentPasswordMap.get(data[i].email);

      if (!parentPassData) {
        throw badRequest(`Row ${i + 2}: Password data processing failed`);
      }

      if (
        !row.username ||
        !row.email ||
        !row.password ||
        !row.grade ||
        !row.major ||
        !row.section
      ) {
        throw badRequest(`Row ${rowNum}: Missing required fields`);
      }

      if (existingEmailSet.has(row.email)) {
        throw badRequest(
          `Row ${rowNum}: Email ${row.email} is already registered`,
        );
      }

      const classKey = `${row.grade}-${row.major}-${row.section}`;
      const classId = classroomMap.get(classKey);
      if (!classId)
        throw badRequest(`Row ${rowNum}: Classroom ${classKey} not found`);

      // Pre-generate IDs
      const studentUserId = createId();
      const parentUserId = createId();

      // Student User
      usersToCreate.push({
        id: studentUserId,
        name: row.username,
        email: row.email,
        password: studentPasswordMap.get(row.email),
        role: "STUDENT" as const,
      });

      // Student Profile
      studentProfilesToCreate.push({
        userId: studentUserId,
        classId: classId,
        studentRole: row.studentRole,
      });

      // Parent Logic
      const parentEmail = `${row.username.toLowerCase().replace(/\s/g, "")}.parent@school.com`;

      const { rawParentPass, hashedParentPass } = parentPassData;

      usersToCreate.push({
        id: parentUserId,
        name: `${row.username}'s Parent`,
        email: parentEmail,
        password: hashedParentPass,
        role: "PARENT" as const,
      });

      parentsToCreate.push({
        userId: parentUserId,
        studentId: studentUserId, // Linking to Student User ID
      });

      parentAccountsForExcel.push({
        studentName: row.username,
        parentEmail,
        parentPassword: rawParentPass,
      });

      // Gradebooks Logic
      const relevantSubjects = allSubjects.filter((subject) => {
        const isGradeAllowed = subject.config.allowedGrades.includes(
          row.grade as any,
        );
        const isMajorAllowed = subject.config.allowedMajors.includes(
          row.major as any,
        );
        return isGradeAllowed && isMajorAllowed;
      });

      for (const subject of relevantSubjects) {
        gradebooksToCreate.push({
          studentId: studentUserId,
          subjectId: subject.id,
          semester,
        });
      }
    }

    // SEQUENTIAL BULK TRANSACTION
    await prisma.$transaction(
      async (tx) => {
        await tx.user.createMany({ data: usersToCreate });
        await tx.student.createMany({ data: studentProfilesToCreate });
        await tx.parent.createMany({ data: parentsToCreate });
        await tx.gradebook.createMany({ data: gradebooksToCreate });
      },
      { timeout: 30000 },
    );

    // 5. GENERATE RESPONSE FILE
    const parentSheet = XLSX.utils.json_to_sheet(parentAccountsForExcel);
    const parentBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(parentBook, parentSheet, "Parent Accounts");
    const outBuffer = XLSX.write(parentBook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new Response(outBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=parent-accounts.xlsx",
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
