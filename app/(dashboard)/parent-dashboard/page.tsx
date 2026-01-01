import React from "react";
import { auth } from "@/lib/auth/authNode";
import { redirect } from "next/navigation";
import { getRoleDashboard, isParentRole } from "@/lib/constants/roles";

const page = async () => {
    const session = await auth();

    if (!session) redirect("/sign-in");

    if (!isParentRole(session.user.role)) {
        redirect(getRoleDashboard(session.user.role));
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Parent Dashboard</h1>
            <p>Welcome, {session.user.name}</p>
        </div>
    );
};

export default page;