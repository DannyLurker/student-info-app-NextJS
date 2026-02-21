"use client";

import { ClassSection, Grade, Major } from "../../../../lib/constants/class";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/card";
import { GraduationCap, BookOpen } from "lucide-react";
import axios from "axios";
import { getFullClassLabel } from "../../../../lib/utils/labels";
import { useQuery } from "@tanstack/react-query";
import { ASSESSMENT_KEYS } from "../../../../lib/constants/tanStackQueryKeys";
import { Session } from "../../../../lib/types/session";

interface TeachingAssignment {
  class: {
    grade: string;
    major: string;
    section: string;
  };
  subject: {
    id: number;
    name: string;
  };
}

interface DashboardData {
  teachingAssignments: TeachingAssignment[];
}

interface TeacherDashboardProps {
  session: Session;
}

const TeacherDashboard = ({ session }: TeacherDashboardProps) => {
  const { data, isLoading: loading } = useQuery<DashboardData>({
    queryKey: ASSESSMENT_KEYS.all,
    queryFn: async () => {
      const response = await axios.get<DashboardData>(
        "/api/teacher/teaching-assignments",
      );
      return response.data;
    },
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="shadow-none border border-gray-200">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="h-20 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Header — full width */}
      <div className="lg:col-span-2 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-6 rounded-2xl text-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>

          {session.isHomeroomClassTeacher && (
            <span className="bg-emerald-500/20 px-3 py-1 rounded text-xs font-medium border border-emerald-400/30 text-emerald-100">
              Homeroom Teacher
            </span>
          )}
        </div>

        <div className="text-xl font-bold mb-1">{session.name}</div>
        <div className="text-sm text-blue-100">{session.role}</div>
      </div>

      {/* Teaching Assignments */}
      <Card className="hover:shadow-lg transition-shadow max-h-[400px] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Teaching Assignments</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {data?.teachingAssignments?.length ? (
            <div className="space-y-4">
              {data.teachingAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600 shadow-sm hover:bg-gray-100 transition"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {assignment.subject.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Class{" "}
                      {getFullClassLabel(
                        assignment.class.grade as Grade,
                        assignment.class.major as Major,
                        assignment.class.section as ClassSection,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4">
              No teaching assignments.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Assignments Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        <div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data?.teachingAssignments.length ?? 0}
          </div>
          <div className="text-sm text-gray-500">Total Assignments</div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
