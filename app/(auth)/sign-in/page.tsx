import React from "react";
import SignIn from "../../../components/auth/SignIn";
import { auth } from "../../../lib/auth/authNode";
import { redirect } from "next/navigation";
import { getRoleDashboard } from "../../../lib/constants/roles";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | SMK Advent Student Info App",
  description:
    "Sign in to your account to manage your classroom, grades, and profile.",
  openGraph: {
    title: "Login | SMK Advent Student Info App",
    description: "Access your dashboard securely.",
  },
};

const page = async () => {
  const session = await auth();

  if (!session) return <SignIn />;

  return redirect(getRoleDashboard(session.user.role));
};

export default page;
