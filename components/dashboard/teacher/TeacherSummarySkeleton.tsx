"use client";

import { Skeleton } from "@/components/ui/skeleton";

const TeacherSummarySkeleton = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-4 w-24" />
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-4 w-24" />
            </div>

            {/* Card 3 (Profile) - Spans 2 cols on mobile, 1 on desktop */}
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-xl bg-white/20" />
                    <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
                </div>
                <Skeleton className="h-8 w-32 mb-1 bg-white/20" />
                <Skeleton className="h-4 w-24 bg-white/20" />
            </div>
        </div>
    );
};

export default TeacherSummarySkeleton;
