import React from "react";
import ForgotPasswordForm from "../../../components/auth/ForgotPasswordForm";
import type { Metadata } from "next";
import { auth } from "../../../lib/auth/authNode";
import { redirect } from "next/navigation";
import { getRoleDashboard } from "../../../lib/constants/roles";

export const metadata: Metadata = {
  title: "Forgot Password | Student Info App",
  description: "Reset your password",
};

const page = async () => {
  const session = await auth();

  if (!session) {
    return (
      <div>
        <ForgotPasswordForm />
      </div>
    );
  }

  redirect(getRoleDashboard(session.user.role));
};

export default page;
