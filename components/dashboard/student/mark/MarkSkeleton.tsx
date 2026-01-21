import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const MarkSkeleton = () => {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-[200px]" />
                </div>
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        </div>
    );
};

export default MarkSkeleton;
