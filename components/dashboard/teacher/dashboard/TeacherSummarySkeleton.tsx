"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TeacherDashboardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Header Skeleton — full width */}
      <div className="lg:col-span-2 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-12 h-12 rounded-xl bg-white/20" />
          <Skeleton className="w-28 h-6 rounded bg-white/20" />
        </div>

        <Skeleton className="h-6 w-40 mb-2 bg-white/20" />
        <Skeleton className="h-4 w-28 bg-white/20" />
      </div>

      {/* Teaching Assignments Card Skeleton */}
      <Card className="shadow-none border border-gray-200 max-h-[400px]">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-200"
              >
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Assignments Card Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>

        <div>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardSkeleton;
