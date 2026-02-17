"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Pencil,
  Trash2,
  School,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import {
  GRADE_DISPLAY_MAP,
  MAJOR_DISPLAY_MAP,
  SECTION_DISPLAY_MAP,
} from "@/lib/utils/labels";
import ClassroomForm from "./ClassroomForm";
import { CLASSROOM_KEYS } from "@/lib/constants/tanStackQueryKeys";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ManageClassroomForm = () => {
  // State
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Search & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const queryClient = useQueryClient();

  // Fetch all classrooms
  const { data, isLoading } = useQuery({
    queryKey: CLASSROOM_KEYS.all,
    queryFn: async () => {
      const response = await axios.get("/api/staff/classroom");
      return response.data.data;
    },
  });

  // Client-side Filtering & Sorting
  const filteredClassrooms = React.useMemo(() => {
    let result = data || [];

    // Search (Debounced)
    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      result = result.filter((item: any) => {
        const grade =
          GRADE_DISPLAY_MAP[item.grade as keyof typeof GRADE_DISPLAY_MAP] ||
          item.grade;
        const major =
          MAJOR_DISPLAY_MAP[item.major as keyof typeof MAJOR_DISPLAY_MAP] ||
          item.major;
        // Search by grade, major, section, or teacher name
        const teacherName = item.homeroomTeacher?.user?.name || "";

        const fullString =
          `${grade} ${major} ${item.section} ${teacherName}`.toLowerCase();
        return fullString.includes(lowerQuery);
      });
    }

    // Sort
    result.sort((a: any, b: any) => {
      const GRADE_ORDER = { TENTH: 10, ELEVENTH: 11, TWELFTH: 12 };

      // Di dalam sort:
      const orderA = GRADE_ORDER[a.grade as keyof typeof GRADE_ORDER] || 0;
      const orderB = GRADE_ORDER[b.grade as keyof typeof GRADE_ORDER] || 0;
      return sortOrder === "asc" ? orderA - orderB : orderB - orderA;
    });

    return result;
  }, [data, debouncedSearchQuery, sortOrder]);

  const handleDelete = async () => {
    if (!deleteItem) return;

    const deletePromise = axios.delete("/api/staff/classroom", {
      params: {
        classId: deleteItem.id,
      },
    });

    toast.promise(deletePromise, {
      loading: "Deleting classroom...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: CLASSROOM_KEYS.all });
        // Also invalidate teachers as a teacher might become freed up
        queryClient.invalidateQueries({
          queryKey: CLASSROOM_KEYS.nonHomeroom(),
        });
        setDeleteItem(null);
        return "Classroom deleted successfully";
      },
      error: (err) => {
        return err.response?.data?.message || "Failed to delete classroom";
      },
    });
  };

  if (editItem) {
    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Edit Classroom</h3>
          <Button variant="ghost" onClick={() => setEditItem(null)}>
            Back to List
          </Button>
        </div>
        <ClassroomForm
          mode="edit"
          initialData={editItem}
          onSuccess={() => {
            setEditItem(null);
            // Queries invalidated inside form
          }}
          onCancel={() => setEditItem(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Search & Sort */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wider">
          Search & Filter
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by grade, major, teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "asc" ? "10 → 12" : "12 → 10"}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white min-h-[400px] rounded-xl border shadow-sm p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-full min-h-[300px]">
            <Spinner />
          </div>
        ) : filteredClassrooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
            <AlertTriangle className="w-12 h-12 mb-2 opacity-20" />
            <p>No classrooms found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClassrooms.map((item: any) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row gap-4 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
              >
                {/* Icon */}
                <div className="p-2 rounded-full h-fit bg-blue-100 text-blue-700">
                  <School className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h4 className="font-semibold text-gray-800">
                    {
                      GRADE_DISPLAY_MAP[
                        item.grade as keyof typeof GRADE_DISPLAY_MAP
                      ]
                    }{" "}
                    -{" "}
                    {
                      MAJOR_DISPLAY_MAP[
                        item.major as keyof typeof MAJOR_DISPLAY_MAP
                      ]
                    }
                  </h4>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Section Badge */}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                      Section{" "}
                      {SECTION_DISPLAY_MAP[
                        item.section as keyof typeof SECTION_DISPLAY_MAP
                      ] || item.section}
                    </span>

                    {/* Teacher Badge / Text */}
                    {item.homeroomTeacher?.user?.name ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium flex items-center gap-1">
                        Teacher: {item.homeroomTeacher.user.name}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium italic">
                        No Homeroom Teacher
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => setEditItem(item)}
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 hover:bg-red-50 hover:border-red-200"
                    onClick={() => setDeleteItem(item)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Alert */}
      <AlertDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              classroom.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageClassroomForm;
