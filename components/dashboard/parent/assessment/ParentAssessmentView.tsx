"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AssessmentStatsCards from "../../assessment/AssessmentStatsCards";
import AssessmentTable from "../../assessment/AssessmentTable";
import AssessmentSkeleton from "../../assessment/AssessmentSkeleton";
import { toast } from "sonner";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AssessmentType } from "@/lib/constants/assessments";

interface Subject {
  id: number;
  subjectName: string;
}

interface StudentInfo {
  id: string;
  grade: string;
  major: string;
  classNumber: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface ParentMarkAssessmentProps {
  subjects: Subject[];
  studentInfo: StudentInfo;
}

interface AssessmentScore {
  score: number;
  assessment: {
    givenAt: string;
    dueAt: string;
    title: string;
    type: AssessmentType;
  };
}

interface AssessmentScoreResponse {
  assessmentScores: AssessmentScore[];
  totalRecords?: number;
}

const ParentAssessmentView = ({ subjects, studentInfo }: ParentMarkAssessmentProps) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  // Initialize selected subject with first available
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const fetchAssessmentScores = async (
    studentId: string,
    subjectId: number,
    page: number
  ): Promise<AssessmentScoreResponse> => {
    const response = await axios.get("/api/parent/student-assessment-score", {
      params: {
        studentId,
        subjectId,
        page,
      },
    });

    console.log(response.data)

    return response.data;
  };

  const { data, isLoading: loading, isError } = useQuery<AssessmentScoreResponse>({
    queryKey: ["parentAssessmentScores", studentInfo.id, selectedSubjectId, page],
    queryFn: () => fetchAssessmentScores(studentInfo.id, selectedSubjectId!, page),
    enabled: !!selectedSubjectId && !!studentInfo.id,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch student marks");
    }
  }, [isError]);

  const assessmentScoreData = data?.assessmentScores || [];
  const totalRecords = data?.totalRecords || assessmentScoreData.length;

  const recordsPerPage = 10;
  const hasMore = (page + 1) * recordsPerPage < totalRecords;

  const selectedSubjectName = useMemo(() => {
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    if (!subject) return "";
    return subject.subjectName;
  }, [subjects, selectedSubjectId]);

  const studentNameDisplay = studentInfo.firstName
    ? `${studentInfo.firstName}'s Marks`
    : studentInfo.name
      ? `${String(studentInfo.name).split(" ")[0]}'s Marks`
      : "Student's Marks";

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-2xl sm:text-4xl mt-10 lg:mt-0">
        {studentNameDisplay}
      </h1>

      {/* Subject Dropdown */}
      <div className="w-[250px]">
        <Select
          value={selectedSubjectId ? String(selectedSubjectId) : ""}
          onValueChange={(val) => {
            setSelectedSubjectId(Number(val));
            setPage(0); // Reset page on subject change
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((sub) => (
              <SelectItem key={sub.id} value={String(sub.id)}>
                {sub.subjectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && assessmentScoreData.length === 0 ? (
        <AssessmentSkeleton />
      ) : (
        <div>
          <AssessmentStatsCards
            subjectName={selectedSubjectName}
            totalAssignments={totalRecords}
          />

          <AssessmentTable
            marks={assessmentScoreData}
            page={page}
            hasMore={hasMore}
            onPageChange={setPage}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default ParentAssessmentView;
