import { auth } from "@/lib/auth/authNode";
import { getRoleDashboard, isStudentRole } from "@/lib/constants/roles";
import { prisma } from "@/prisma/prisma";
import { redirect } from "next/navigation";
import React from "react";
import StudentMarkView from "@/components/dashboard/student/mark/StudentMarkView";

const page = async () => {
    const session = await auth();

    if (!session) redirect("/sign-in");

    if (!isStudentRole(session.user.role)) {
        redirect(getRoleDashboard(session.user.role));
    }

    // Fetch student details and subjects
    const student = await prisma.student.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            id: true,
            grade: true,
            major: true,
            classNumber: true,
            studentSubjects: {
                select: {
                    id: true,
                    subjectName: true,
                },
            },
        },
    });

    if (!student) {
        return <div>Student profile not found.</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">My Marks</h1>
            <StudentMarkView
                subjects={student.studentSubjects}
                studentInfo={{
                    id: student.id,
                    grade: student.grade,
                    major: student.major,
                    classNumber: student.classNumber
                }}
            />
        </div>
    );
};

export default page;
