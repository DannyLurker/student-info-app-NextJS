import CreateAccountPage from "@/components/auth/createUser/CreateAccountPage";
import { auth } from "@/lib/auth/authNode";
import { redirect } from "next/navigation";
import { isStaffRole, getRoleDashboard } from "@/lib/constants/roles";
import { Sidebar } from "@/components/dashboard/Sidebar";

const Page = async () => {
    const session = await auth();

    if (!session) return redirect("/sign-in");

    const isStaff = isStaffRole(session.user.role);

    if (!isStaff) {
        return redirect(getRoleDashboard(session.user.role));
    }

    return <>
        <Sidebar role={session.user.role} />
        <CreateAccountPage />
    </>;
};

export default Page;
