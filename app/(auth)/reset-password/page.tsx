import ResetPasswordForm from "../../../components/auth/ResetPasswordForm";
import type { Metadata } from "next";
import { auth } from "../../../lib/auth/authNode";
import { redirect } from "next/navigation";
import { getRoleDashboard } from "../../../lib/constants/roles";

export const metadata: Metadata = {
  title: "Reset Password | Student Info App",
  description: "Create a new password",
};

const page = async () => {
  const session = await auth();

  if (!session) {
    return (
      <div>
        <ResetPasswordForm />
      </div>
    );
  }

  redirect(getRoleDashboard(session.user.role));
};

export default page;
