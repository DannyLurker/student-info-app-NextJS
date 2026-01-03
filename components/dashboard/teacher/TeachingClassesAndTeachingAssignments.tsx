"use client";

import { useEffect, useState } from "react";
import { Grade, Major } from "@/lib/constants/class";
import { Role } from "@/lib/constants/roles";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Calendar, GraduationCap, BookOpen } from "lucide-react";
import axios from "axios";

interface TeachingAssignment {
  grade: string;
  major: string;
  classNumber: string;
  subject: {
    subjectName: string;
  };
}

interface TeachingClass {
  grade: Grade;
  major: Major;
  classNumber: string;
}

interface DashboardData {
  teachingClasses: TeachingClass[];
  teachingAssignments: TeachingAssignment[];
}
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    homeroomTeacherId: string | null;
    isHomeroomClassTeacher: boolean;
  };
}

interface TeachingClassesAndTeachingAssignmentsProps {
  session: Session;
}

const TeachingClassesAndTeachingAssignments = ({
  session,
}: TeachingClassesAndTeachingAssignmentsProps) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id) {
        try {
          const response = await axios.get(
            `/api/teacher/teaching-classes-and-assignments`,
            {
              params: {
                teacherId: session.user.id,
              },
            }
          );

          if (response.status === 200) {
            setData(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500">Welcome back, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teaching Classes */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Teaching Classes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.teachingClasses && data.teachingClasses.length > 0 ? (
              <div className="space-y-4">
                {data.teachingClasses.map((cls, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-100"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Class {cls.grade} {cls.major} {cls.classNumber}
                      </h3>
                      <p className="text-sm text-gray-500">Homeroom</p>
                    </div>
                    <GraduationCap className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                No classes assigned.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Teaching Assignments */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Teaching Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.teachingAssignments &&
            data.teachingAssignments.length > 0 ? (
              <div className="space-y-4">
                {data.teachingAssignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600 shadow-sm"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {assignment.subject.subjectName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Class {assignment.grade} {assignment.major}{" "}
                        {assignment.classNumber}
                      </p>
                    </div>
                    <Calendar className="w-5 h-5 text-gray-400" />
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
      </div>
    </div>
  );
};

export default TeachingClassesAndTeachingAssignments;
