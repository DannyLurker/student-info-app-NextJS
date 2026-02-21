import AttendanceManager from "../../../components/dashboard/attendance/AttendanceManager";
import { auth } from "../../../lib/auth/authNode";
import {
  getRoleDashboard,
  isClassSecretaryRole,
  isTeacherRole,
} from "../../../lib/constants/roles";
import { redirect } from "next/navigation";

import React from "react";

const page = async () => {
  const session = await auth();

  if (!session) return redirect("/sign-in");

  const isHomeroomTeacher =
    isTeacherRole(session.user.role) && session.user.isHomeroomClassTeacher;

  if (!isClassSecretaryRole(session.user.role) && !isHomeroomTeacher) {
    redirect(getRoleDashboard(session.user.role));
  }

  return <AttendanceManager session={session.user} />;
};

export default page;
