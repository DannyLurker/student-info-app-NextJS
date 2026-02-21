import { auth } from "@/lib/auth/authNode";
import { getRoleDashboard, isParentRole } from "@/lib/constants/roles";
import { redirect } from "next/navigation";
import React from "react";
import ParentAssessmentWrapper from "@/components/dashboard/parent/assessment/ParentAssessmentWrapper";

const page = async () => {
  const session = await auth();

  if (!session) redirect("/sign-in");

  if (!isParentRole(session.user.role)) {
    redirect(getRoleDashboard(session.user.role));
  }

  return (
    <div className="p-6">
      <ParentAssessmentWrapper session={session.user} />
    </div>
  );
};

export default page;
