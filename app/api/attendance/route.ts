import { handleError } from "../../../lib/errors";
import {
  ClassSecretarySession,
  HomeroomTeacherSession,
  validateHomeroomTeacherSession,
  validateSecretarySession,
} from "@/domain/auth/role-guards";
import {
  bulkAttendanceSchema,
  studentAttendacesQueriesSchema,
} from "@/lib/zod/attendance";

import {
  createAttendance,
  getAttendance,
} from "@/services/attendance/attendance-service";
import { assertClassManagementAccess } from "@/domain/auth/authorize-requests";
import { printConsoleError } from "@/lib/utils/printError";

export async function POST(req: Request) {
  try {
    let secretarySession: null | ClassSecretarySession = null;
    let homeroomTeacherSession: null | HomeroomTeacherSession = null;

    try {
      secretarySession = await validateSecretarySession();
    } catch {}

    try {
      homeroomTeacherSession = await validateHomeroomTeacherSession();
    } catch {}

    assertClassManagementAccess(secretarySession, homeroomTeacherSession);

    const rawData = await req.json();
    const data = bulkAttendanceSchema.parse(rawData);

    const result = await createAttendance(
      data,
      secretarySession,
      homeroomTeacherSession,
    );

    return Response.json({
      message: "Attendance data created successfully",
      data: result,
    });
  } catch (error) {
    printConsoleError(error, "POST", "/api/attendance");
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    let secretarySession: null | ClassSecretarySession = null;
    let homeroomTeacherSession: null | HomeroomTeacherSession = null;

    try {
      secretarySession = await validateSecretarySession();
    } catch {}

    try {
      homeroomTeacherSession = await validateHomeroomTeacherSession();
    } catch {}

    assertClassManagementAccess(secretarySession, homeroomTeacherSession);

    const { searchParams } = new URL(req.url); // Use standard URL for search params

    const rawParams = Object.fromEntries(searchParams.entries());

    const data = studentAttendacesQueriesSchema.parse(rawParams);

    const response = await getAttendance(
      data,
      secretarySession,
      homeroomTeacherSession,
    );

    return Response.json(
      {
        message: "Attendance retrieved successfully.",
        data: {
          studentAttendanceRecords: response.studentAttendanceRecords,
          totalStudents: response.totalStudents,
          stats: response.attendanceStats,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    printConsoleError(error, "GET", "/api/attendance");
    return handleError(error);
  }
}
