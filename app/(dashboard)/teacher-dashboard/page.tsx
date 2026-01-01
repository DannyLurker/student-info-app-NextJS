import React from "react";
import { auth } from "@/lib/auth/authNode";
import { redirect } from "next/navigation";
import { getRoleDashboard, isTeacherRole } from "@/lib/constants/roles";

const page = async () => {
  const session = await auth();

  if (!session) redirect("/sign-in");

  if (!isTeacherRole(session.user.role)) {
    redirect(getRoleDashboard(session.user.role));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
    </div>
  );
};

export default page;
