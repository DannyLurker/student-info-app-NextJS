"use client";

import React from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Session } from "@/lib/types/session";
import { useQuery } from "@tanstack/react-query";
import { PARENT_KEYS } from "@/lib/constants/tanStackQueryKeys";
import ParentAssessmentView from "./ParentAssessmentView";

interface ParentAssessmentWrapperProps {
    session: Session;
}

const ParentAssessmentWrapper = ({ session }: ParentAssessmentWrapperProps) => {
    const {
        data: studentInfo,
        isLoading: studentLoading,
        isError: studentError
    } = useQuery({
        queryKey: PARENT_KEYS.profile(), // Using profile query key
        queryFn: async () => {
            const res = await axios.get("/api/parent/student-profile");
            const data = res.data.data;
            return {
                ...data.student,
                firstName: data.studentName,
            };
        },
        enabled: !!session?.id,
    });

    const {
        data: subjects = [],
        isLoading: subjectsLoading,
        isError: subjectsError
    } = useQuery({
        queryKey: ["parentStudentSubjects", session?.id],
        queryFn: async () => {
            const res = await axios.get("/api/parent/student-subject");
            return res.data.subjects.map((s: any) => ({
                id: s.id,
                subjectName: s.name
            }));
        },
        enabled: !!session?.id,
    });

    if (studentError || subjectsError) {
        toast.error("Failed to load student data.");
    }

    if (studentLoading || subjectsLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    if (!studentInfo) {
        return <div>No student data found for this parent account.</div>;
    }

    return (
        <ParentAssessmentView
            subjects={subjects}
            studentInfo={studentInfo}
        />
    );
};

export default ParentAssessmentWrapper;
