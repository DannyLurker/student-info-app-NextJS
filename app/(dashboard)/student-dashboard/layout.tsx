"use client";

import { Sidebar } from "@/components/ui/Sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/sign-in");
        }
        if (status === "authenticated") {
            if (session?.user?.role === "teacher") {
                router.push("/teacher-dashboard");
            }
            if (
                session?.user?.role === "vicePrincipal" ||
                session?.user?.role === "principal"
            ) {
                router.push("/staff-dashboard");
            }
        }
    }, [status, session, router]);

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <Sidebar role={session?.user?.role} />
            {/* Main Content - responsive margin */}
            <main className="lg:ml-64 pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
