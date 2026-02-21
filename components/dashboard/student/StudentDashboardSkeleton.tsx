"use client";

import { Skeleton } from "../../../components/ui/skeleton";

const StudentDashboardSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-12 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-12 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Card 3 (Profile) */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-xl bg-white/20" />
          </div>
          <Skeleton className="h-8 w-32 mb-1 bg-white/20" />
          <Skeleton className="h-4 w-24 bg-white/20" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Attendance Chart Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl border max-h-[500px] border-[#E5E7EB] shadow-sm p-4 sm:p-6">
          <Skeleton className="h-7 w-64 mb-6" />
          <div className="flex items-center justify-center">
            <Skeleton className="w-64 h-64 rounded-full" />
          </div>
          <div className="mt-4 text-center">
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        </div>

        {/* Attendance Information Skeleton */}
        <div className="bg-white rounded-lg shadow p-6 max-h-[500px]">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded" />
            <Skeleton className="h-24 w-full rounded" />
            <Skeleton className="h-24 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardSkeleton;
