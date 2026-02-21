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
import AssessmentStatsCards from "./AssessmentStatsCards";
import AssessmentTable from "./AssessmentTable";
import AssessmentSkeleton from "./AssessmentSkeleton";
import { toast } from "sonner";
import { Session } from "@/lib/types/session";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ASSESSMENT_KEYS,
  SUBJECT_KEYS,
} from "@/lib/constants/tanStackQueryKeys";
import { AssessmentType } from "@/lib/constants/assessments";

interface Subject {
  id: number;
  name: string;
}

interface SubjectResponse {
  subjects: Subject[];
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

const StudentAssessmentView = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchSubjects = async (): Promise<Subject[]> => {
    const response = await axios.get<SubjectResponse>("/api/student/subject");
    return response.data.subjects;
  };

  const {
    data: subjectData = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useQuery({
    queryKey: SUBJECT_KEYS.all,
    queryFn: fetchSubjects,
  });

  useEffect(() => {
    if (subjectsError) {
      toast.error("Failed to retrieve subjects");
    }
  }, [subjectsError]);

  // ======================

  const selectedSubjectName = useMemo(() => {
    return subjectData.find((s) => s.id === selectedSubjectId)?.name || "";
  }, [subjectData, selectedSubjectId]);

  const fetchAssessmentScores = async (subjectId: number, page: number) => {
    const response = await axios.get("/api/student/assessment-score", {
      params: {
        subjectId,
        page,
      },
    });

    return response.data.assessmentScores;
  };

  const { data: assessmentScoreData = [], isLoading: loading } = useQuery<
    AssessmentScore[]
  >({
    queryKey: ["assessmentScores", selectedSubjectId, page],
    queryFn: () => fetchAssessmentScores(selectedSubjectId!, page),
    enabled: !!selectedSubjectId,
    placeholderData: keepPreviousData,
  });

  const recordsPerPage = 10;
  const hasMore = (page + 1) * recordsPerPage < totalRecords;

  return (
    <div className="space-y-6">
      {/* Subject Dropdown */}
      <div className="w-[250px]">
        <Select
          value={selectedSubjectId ? String(selectedSubjectId) : ""}
          onValueChange={(val) => {
            setSelectedSubjectId(Number(val));
            setPage(0);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjectData.map((sub) => (
              <SelectItem key={sub.id} value={String(sub.id)}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {subjectsLoading && assessmentScoreData.length === 0 ? (
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
            isLoading={subjectsLoading}
          />
        </div>
      )}
    </div>
  );
};

export default StudentAssessmentView;
