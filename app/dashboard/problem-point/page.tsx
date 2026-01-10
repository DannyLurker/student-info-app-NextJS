import { auth } from "@/lib/auth/authNode";
import { getRoleDashboard, isAllStaffRole } from "@/lib/constants/roles";
import { redirect } from "next/navigation";
import ProblemPointPageClient from "@/components/dashboard/problemPoint/ProblemPointPageClient";

const Page = async () => {
    const session = await auth();

    if (!session) {
        return redirect("/sign-in");
    }

    if (!isAllStaffRole(session.user.role)) {
        return redirect(getRoleDashboard(session.user.role));
    }

    return <ProblemPointPageClient session={session} />;
};

export default Page;
