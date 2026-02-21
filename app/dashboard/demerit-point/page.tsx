import { auth } from "../../../lib/auth/authNode";
import { getRoleDashboard, isAllStaffRole } from "../../../lib/constants/roles";
import { redirect } from "next/navigation";
import DemeritPointPageClient from "../../../components/dashboard/demerit-point/DemeritPointPageClient";

const Page = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/sign-in");
  }

  if (!isAllStaffRole(session.user.role)) {
    return redirect(getRoleDashboard(session.user.role));
  }

  return <DemeritPointPageClient />;
};

export default Page;
