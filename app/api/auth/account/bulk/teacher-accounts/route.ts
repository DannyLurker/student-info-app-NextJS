import { badRequest, handleError } from "@/lib/errors";
import { prisma } from "@/db/prisma";
import hashing from "@/lib/utils/hashing";
import * as XLSX from "xlsx";
import {
  ClassSection,
  Grade,
  GRADES,
  Major,
  MAJORS,
} from "@/lib/constants/class";
import { getFullClassLabel } from "@/lib/utils/labels";
import { validateManagementSession } from "@/lib/validation/guards";
import {
  TeacherCreateManyInput,
  TeachingAssignmentCreateManyInput,
  UserCreateManyInput,
} from "@/db/prisma/src/generated/prisma/models";
import { createId } from "@paralleldrive/cuid2";

type TeacherAccountExcel = {
  name: string;
  email: string;
  password: string;
  homeroomGrade?: Grade;
  homeroomMajor?: Major;
  homeroomClassSection?: ClassSection;
  teachingAssignments?: string; // Comma-separated: "math:tenth:accounting:1,english:eleventh:softwareEngineering:2"
};

export async function POST(req: Request) {
  try {
    validateManagementSession();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw badRequest("No file uploaded");
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet) as TeacherAccountExcel[];

    if (data.length === 0) {
      throw badRequest("Excel file is empty");
    }

    // PRE-FETCH DATA FOR VALIDATION
    const excelEmails = data.map((row) => row.email).filter(Boolean);
    const [existingUsers, allClassrooms, allSubjects] = await Promise.all([
      prisma.user.findMany({
        where: { email: { in: excelEmails }, role: "STAFF" },
        select: { email: true },
      }),
      prisma.classroom.findMany(),
      prisma.subject.findMany({
        select: { id: true, name: true, config: true },
      }),
    ]);
    const existingEmailSet = new Set(existingUsers.map((u) => u.email));
    const classroomMap = new Map(
      allClassrooms.map((c) => [
        `${c.grade}-${c.major}-${c.section}`,
        { id: c.id, homeroomTeacherId: c.homeroomTeacherId },
      ]),
    );
    const subjectMap = new Map(
      allSubjects.map((s) => [s.name, { subjectId: s.id, config: s.config }]),
    );

    // PREPARE COLLECTIONS
    const usersToCreate: UserCreateManyInput[] = [];
    const teacherProfilesToCreate: TeacherCreateManyInput[] = [];
    const teachingAssignmentsToCreate: TeachingAssignmentCreateManyInput[] = [];
    const classroomsToUpdate: {
      where: { id: number };
      data: { homeroomTeacherId: string };
    }[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;
      // Validate required fields
      if (!row.name || !row.email || !row.password) {
        throw badRequest(`Row ${rowNumber}: Missing required fields`);
      }

      // Validate grade and major
      if (row.homeroomGrade) {
        if (!GRADES.includes(row.homeroomGrade as Grade)) {
          throw badRequest(
            `Row ${rowNumber}: Invalid grade format in homeroom.`,
          );
        }
      }

      if (row.homeroomMajor) {
        if (!MAJORS.includes(row.homeroomMajor as Major)) {
          throw badRequest(
            `Row ${rowNumber}: Invalid major format in homeroom.`,
          );
        }
      }

      // Check if teacher already exists
      if (existingEmailSet.has(row.email)) {
        throw badRequest(`Row ${rowNumber}:Email already registered`);
      }

      // Hash password
      const hashedPassword = await hashing(row.password);

      //Pre-generate id
      const teacherUserId = createId();

      // Handle Homeroom Class
      if (row.homeroomGrade && row.homeroomMajor && row.homeroomClassSection) {
        const existingClassroom = classroomMap.get(
          `${row.homeroomGrade}-${row.homeroomMajor}-${row.homeroomClassSection}`,
        );

        const classLabel = getFullClassLabel(
          row.homeroomGrade,
          row.homeroomMajor,
          row.homeroomClassSection,
        );

        if (!existingClassroom) {
          throw badRequest(`Row ${rowNumber}: ${classLabel} not found`);
        }

        const { id, homeroomTeacherId } = existingClassroom;

        console.log(id, homeroomTeacherId);
        if (homeroomTeacherId) {
          throw badRequest(
            `Row ${rowNumber}: ${classLabel} already has a homeroom teacher`,
          );
        }

        console.log(row.homeroomClassSection);

        classroomsToUpdate.push({
          where: {
            id: id,
          },
          data: {
            homeroomTeacherId: teacherUserId,
          },
        });
      }

      // Create teacher
      usersToCreate.push({
        id: teacherUserId,
        name: row.name,
        email: row.email,
        password: hashedPassword,
        role: "STAFF",
      });

      teacherProfilesToCreate.push({
        userId: teacherUserId,
        staffRole: "TEACHER",
      });

      if (row.teachingAssignments && row.teachingAssignments?.length > 0) {
        const transformTeachingAssignments = row.teachingAssignments
          .split(",")
          .map((s) => s.trim());

        const teachingAssignmentUniqueKey = new Set();

        // ta = teaching assignemnt
        // Validate: Check for duplicate assignments (same subject in same class)
        transformTeachingAssignments.forEach((ta) => {
          const [subjectName, grade, major, section] = ta.split(":");
          const key = `${subjectName}-${grade}-${major}-${section}`;

          if (teachingAssignmentUniqueKey.has(key)) {
            const classLabel = getFullClassLabel(
              grade as Grade,
              major as Major,
              section as ClassSection,
            );
            throw badRequest(
              `Duplicate assignment detected! You cannot teach "${subjectName}" more than once in ${classLabel}.`,
            );
          }

          teachingAssignmentUniqueKey.add(key);
        });

        transformTeachingAssignments.forEach((ta) => {
          const [subjectName, grade, major, section] = ta.split(":");

          if (grade) {
            if (!GRADES.includes(grade as Grade)) {
              throw badRequest(
                `Row ${rowNumber}: Invalid grade format in teaching classes.`,
              );
            }
          }

          if (major) {
            if (!MAJORS.includes(major as Major)) {
              throw badRequest(
                `Row ${rowNumber}: Invalid major format in teaching classes.`,
              );
            }
          }

          const classroomKey = `${grade}-${major}-${section}`;
          const classroom = classroomMap.get(classroomKey);

          const classLabel = getFullClassLabel(
            grade as Grade,
            major as Major,
            section as ClassSection,
          );

          if (!classroom) {
            throw badRequest(`Row ${i + 1}: ${classLabel} not found`);
          }

          const { id, homeroomTeacherId } = classroom;

          // From DB
          const subjectMapData = subjectMap.get(subjectName);

          if (!subjectMapData) {
            throw badRequest(
              `Subject ${subjectName} not found. Please check your subject data.`,
            );
          }

          const { subjectId, config } = subjectMapData;

          const isGradeInclude = config.allowedGrades.includes(grade as Grade);

          const isMajorInclude = config.allowedMajors.includes(major as Major);

          if (!(isGradeInclude && isMajorInclude)) {
            throw badRequest(`${subjectName}: Config miss match`);
          }

          teachingAssignmentsToCreate.push({
            subjectId: subjectId,
            teacherId: teacherUserId,
            classId: id,
          });
        });
      }
    }

    // Process each teacher
    await prisma.$transaction(async (tx) => {
      await tx.user.createMany({ data: usersToCreate });
      await tx.teacher.createMany({ data: teacherProfilesToCreate });
      if (classroomsToUpdate.length > 0) {
        await Promise.all(
          classroomsToUpdate.map((item) =>
            tx.classroom.update({
              where: item.where,
              data: item.data,
            }),
          ),
        );
      }
      await tx.teachingAssignment.createMany({
        data: teachingAssignmentsToCreate,
      });
    });

    return Response.json(
      {
        message: `Bulk import completed.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/auth/account/bulk/teacher-accounts",
      message: error instanceof Error ? error.message : String(error),
    });
    return handleError(error);
  }
}
