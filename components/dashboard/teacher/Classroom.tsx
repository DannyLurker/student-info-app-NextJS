"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Role } from "@/lib/constants/roles";
import axios from "axios";

interface Attendance {
  date: string;
  type: string;
  description: string;
}

interface Student {
  id: string;
  name: string;
  attendances: Attendance[];
}

interface ClassroomData {
  students: Student[];
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

interface ClassroomProps {
  session: Session;
}

const Classroom = ({ session }: ClassroomProps) => {
  const [data, setData] = useState<ClassroomData | null>(null);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id && date) {
        setLoading(true);
        try {
          const response = await axios.get(
            `/api/teacher/homeroom-class-students-list`,
            {
              params: {
                teacherId: session.user.id,
                date: date,
              },
            }
          );

          console.log(response);

          if (response.status === 200) {
            setData(response.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch classroom data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [session?.user?.id, date]);

  const getAttendanceStatus = (attendances: Attendance[]) => {
    if (!attendances || attendances.length === 0) {
      return {
        label: "Not Recorded",
        icon: HelpCircle,
        color: "text-gray-400",
      };
    }
    const attendance = attendances[0];
    switch (attendance.type) {
      case "PRESENT":
        return { label: "Present", icon: CheckCircle, color: "text-green-500" };
      case "ABSENT":
        return { label: "Absent", icon: XCircle, color: "text-red-500" };
      case "LATE":
        return { label: "Late", icon: Clock, color: "text-yellow-500" };
      case "PERMISSION":
        return {
          label: "Permission",
          icon: AlertCircle,
          color: "text-blue-500",
        };
      case "SICK":
        return { label: "Sick", icon: AlertCircle, color: "text-orange-500" };
      case "ALPHA":
        return { label: "Alpha", icon: XCircle, color: "text-red-500" };
      default:
        return {
          label: attendance.type,
          icon: HelpCircle,
          color: "text-gray-500",
        };
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent future dates
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= new Date()) {
      setDate(e.target.value);
    } else {
      // Ideally show a toast or message, but input max attribute handles UI constraint
      // This is a fallback backup
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homeroom Class</h1>
          <p className="text-gray-500">Manage student attendance</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm">
          <Calendar className="w-5 h-5 text-gray-500" />
          <Input
            type="date"
            value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={handleDateChange}
            className="border-0 focus-visible:ring-0 w-auto"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Student List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : data?.students && data.students.length > 0 ? (
            <div className="space-y-3">
              {data.students.map((student) => {
                const status = getAttendanceStatus(student.attendances);
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {student.attendances[0]?.description ||
                            "No description"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${status.color}`}
                    >
                      <status.icon className="w-5 h-5" />
                      <span className="font-medium">{status.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-8">
              No students found in homeroom class.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Classroom;
