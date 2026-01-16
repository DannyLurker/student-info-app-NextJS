"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MarkStatsCards from "./MarkStatsCards";
import MarkTable from "./MarkTable";
import MarkSkeleton from "./MarkSkeleton";
import { SUBJECT_DISPLAY_MAP } from "@/lib/utils/labels";
import { toast } from "sonner";

interface Subject {
    id: number;
    subjectName: string;
}

interface StudentInfo {
    id: string;
    grade: string;
    major: string;
    classNumber: string;
}

interface StudentMarkViewProps {
    subjects: Subject[];
    studentInfo: StudentInfo;
}

const StudentMarkView = ({ subjects, studentInfo }: StudentMarkViewProps) => {
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [marks, setMarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        if (subjects.length > 0 && !selectedSubject) {
            setSelectedSubject(subjects[0].subjectName);
        }
    }, [subjects, selectedSubject]);

    useEffect(() => {
        if (!selectedSubject) return;

        const fetchMarks = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/api/student/profile", {
                    params: {
                        studentId: studentInfo.id,
                        subjectName: selectedSubject,
                        isMarkPage: true,
                        page,
                    },
                });

                const data = response.data.data.marks;

                let marksData: any[] = [];
                if (data.studentMarkRecords?.subjectMarks?.[0]?.marks) {
                    marksData = data.studentMarkRecords.subjectMarks[0].marks;
                }

                setMarks(marksData);
                setTotalRecords(data.totalMarks || 0);

            } catch (error) {
                console.error("Failed to fetch marks", error);
                toast.error("Failed to fetch marks data");
                setMarks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMarks();
    }, [selectedSubject, page, studentInfo.id]);

    const recordsPerPage = 10;
    const hasMore = (page + 1) * recordsPerPage < totalRecords;

    return (
        <div className="space-y-6">
            {/* Subject Dropdown */}
            <div className="w-[250px]">
                <Select
                    value={selectedSubject}
                    onValueChange={(val) => {
                        setSelectedSubject(val);
                        setPage(0); // Reset page on subject change
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map((sub) => (
                            <SelectItem key={sub.id} value={sub.subjectName}>
                                {SUBJECT_DISPLAY_MAP[sub.subjectName]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading && marks.length === 0 ? (
                <MarkSkeleton />
            ) : (
                <>
                    <MarkStatsCards
                        subjectName={SUBJECT_DISPLAY_MAP[selectedSubject]}
                        totalAssignments={totalRecords}
                    />

                    <MarkTable
                        marks={marks}
                        page={page}
                        hasMore={hasMore}
                        onPageChange={setPage}
                        isLoading={loading}
                    />
                </>
            )}
        </div>
    );
};

export default StudentMarkView;
