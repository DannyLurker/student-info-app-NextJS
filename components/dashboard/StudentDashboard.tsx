import { auth } from "@/lib/auth/authNode";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/prisma";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { AttendanceChart } from "../attendance/AttendanceChart";

const StudentDashboard = async () => {
  const session = await auth();

  if (!session) redirect("/sign-in");

  // Fetch Real Student Data
  const student = await prisma.student.findUnique({
    where: { email: session.user.email || "" },
    include: {
      homeroomTeacher: true,
    }
  });

  if (!student) {
    return <div className="p-10">Student profile not found.</div>;
  }

  // Fetch Attendance Stats
  const attendanceStats = await prisma.studentAttendance.groupBy({
    by: ['type'],
    where: { studentId: student.id },
    _count: true,
  });

  const statsMap = {
    sick: 0,
    permission: 0,
    alpha: 0,
    present: 0
  };

  attendanceStats.forEach(stat => {
    if (statsMap.hasOwnProperty(stat.type)) {
      statsMap[stat.type as keyof typeof statsMap] = stat._count;
    }
  });

  const chartData = [
    { name: "Sick", value: statsMap.sick, color: "#FBBF24" },
    { name: "Permission", value: statsMap.permission, color: "#3B82F6" },
    { name: "Alpha", value: statsMap.alpha, color: "#DC2626" },
  ];

  const totalAbsence = statsMap.sick + statsMap.permission + statsMap.alpha;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
            Welcome back, {student.name}!
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Here's what's happening with your studies today
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 bg-white px-4 py-3 rounded-xl border border-[#E5E7EB]">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                {student.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {student.role}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1E3A8A]/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" />
            </div>
            <span className="text-xl sm:text-2xl">📚</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">-</h3>
          <p className="text-xs sm:text-sm text-gray-600">Total Subjects</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FBBF24]/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#FBBF24]" />
            </div>
            <span className="text-xl sm:text-2xl">📈</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">-</h3>
          <p className="text-xs sm:text-sm text-gray-600">Average Score</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#3B82F6]" />
            </div>
            <span className="text-xl sm:text-2xl">✅</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">{statsMap.present}</h3>
          <p className="text-xs sm:text-sm text-gray-600">Days Present</p>
        </div>

        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-4 sm:p-6 rounded-2xl text-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl">🎓</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-1">Student</h3>
          <p className="text-xs sm:text-sm text-blue-100">{student.role === "student" ? "Student" : student.role === "classSecretary" ? "Class Secretary" : ""}</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Attendance Statistics (Donut Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-[#111827] mb-6">
            Attendance Statistics (Absences)
          </h3>
          <div className="flex items-center justify-center">
            <AttendanceChart data={chartData} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">Total Absences: <span className="font-bold text-gray-900">{totalAbsence}</span></p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-[#111827] mb-6">
            Recent Activities
          </h3>
          <div className="space-y-4">
            <p className="text-gray-500 text-sm italic">No recent activities.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
