"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Spinner } from "../../../ui/spinner";
import { GRADES, MAJORS, CLASS_SECTION } from "../../../../lib/constants/class";
import {
  GRADE_DISPLAY_MAP,
  MAJOR_DISPLAY_MAP,
} from "../../../../lib/utils/labels";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { DEMERIT_POINT_KEYS } from "../../../../lib/constants/tanStackQueryKeys";
import { getErrorMessage } from "../../../../lib/utils/getErrorMessage";

interface Student {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 10;

const CATEGORIES = [
  "LATE",
  "UNIFORM",
  "DISCIPLINE",
  "ACADEMIC",
  "SOCIAL",
  "OTHER",
];

const CATEGORY_LABELS: Record<string, string> = {
  LATE: "Late",
  UNIFORM: "Uniform",
  DISCIPLINE: "Discipline",
  ACADEMIC: "Academic",
  SOCIAL: "Social",
  OTHER: "Other",
};

interface DemeritPointFormProps {
  mode?: "create" | "edit";
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DemeritPointForm({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
}: DemeritPointFormProps) {
  const queryClient = useQueryClient();

  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Class Selection State
  const [selectedClass, setSelectedClass] = useState({
    grade: "",
    major: "",
    section: "",
  });

  // Form State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    category: "",
    point: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // Default to today
  });

  const isClassSelected =
    selectedClass.grade && selectedClass.major && selectedClass.section;

  const totalPages = Math.ceil(totalStudents / ITEMS_PER_PAGE);

  // Fetch students when class selection or page changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!isClassSelected) return;

      setFetchingStudents(true);
      // Only reset students on class change, not page change
      if (currentPage === 0) {
        setStudents([]);
        setSelectedStudentIds([]);
      }

      try {
        const { grade, major, section } = selectedClass;
        const res = await axios.get(`/api/student`, {
          params: {
            grade,
            major,
            section,
            page: currentPage,
          },
        });
        if (res.data) {
          setStudents(
            res.data.data.students.map((s: { user: Student }) => s.user) || [],
          );
          setTotalStudents(res.data.totalStudents || 0);
        }
      } catch (error) {
        console.error("Error fetching students", error);
        toast.error("Failed to fetch students");
        setStudents([]);
      } finally {
        setFetchingStudents(false);
      }
    };

    fetchStudents();
  }, [
    selectedClass.grade,
    selectedClass.major,
    selectedClass.section,
    isClassSelected,
    currentPage,
  ]);

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        category: initialData.category || "",
        point: String(initialData.points ?? initialData.point ?? ""),
        description: initialData.description || "",
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [mode, initialData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: {
      studentsId: string[];
      demeritCategory: string;
      points: number;
      description: string;
      date: string;
    }) => {
      return axios.post("/api/demerit-point", payload);
    },
    onSuccess: async () => {
      toast.success("Demerit points recorded successfully");
      await queryClient.invalidateQueries({
        queryKey: DEMERIT_POINT_KEYS.lists(),
      });
      setFormData({
        category: "",
        point: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setSelectedStudentIds([]);
    },
    onError: async (error: any) => {
      const transformedErrorMessage = await getErrorMessage(error);
      setErrorMessage(transformedErrorMessage);
      toast.error("Something went wrong. Read the message");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: {
      demeritRecordId: number;
      demeritCategory: string;
      points: number;
      description: string;
      date: string;
    }) => {
      return axios.patch("/api/demerit-point", payload);
    },
    onSuccess: async () => {
      toast.success("Demerit point updated successfully");
      await queryClient.invalidateQueries({
        queryKey: DEMERIT_POINT_KEYS.lists(),
      });
      if (onSuccess) onSuccess();
    },
    onError: async (error: any) => {
      const transformedErrorMessage = await getErrorMessage(error);
      setErrorMessage(transformedErrorMessage);
      toast.error("Something went wrong. Read the message");
    },
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    if (mode === "create" && selectedStudentIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (mode === "create") {
      createMutation.mutate({
        studentsId: selectedStudentIds,
        demeritCategory: formData.category,
        points: Number(formData.point),
        description: formData.description,
        date: formData.date,
      });
    } else {
      updateMutation.mutate({
        demeritRecordId: initialData?.id,
        demeritCategory: formData.category,
        points: Number(formData.point),
        description: formData.description,
        date: formData.date,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Class Selection Section - Hide in Edit Mode if not needed */}

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      )}

      {mode === "create" && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            1. Select Class
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={selectedClass.grade}
              onValueChange={(val) =>
                setSelectedClass({ ...selectedClass, grade: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {GRADE_DISPLAY_MAP[g]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedClass.major}
              onValueChange={(val) =>
                setSelectedClass({ ...selectedClass, major: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Major" />
              </SelectTrigger>
              <SelectContent>
                {MAJORS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {MAJOR_DISPLAY_MAP[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedClass.section}
              onValueChange={(val) =>
                setSelectedClass({ ...selectedClass, section: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Class Number" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_SECTION.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "none" ? "None" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Form Section - Locked until class selected (only in create mode) */}
      <div
        className={`transition-opacity duration-300 ${mode === "create" && !isClassSelected ? "opacity-50 pointer-events-none" : "opacity-100"}`}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Selection (Only in Create Mode) */}
          {mode === "create" && (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                2. Select Students
              </h2>
              {fetchingStudents ? (
                <div className="flex justify-center p-8">
                  <Spinner />
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedStudentIds.length === students.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-2 border rounded-md">
                    {students.map((student) => {
                      const isSelected = selectedStudentIds.includes(
                        student.id,
                      );
                      return (
                        <div
                          key={student.id}
                          onClick={() => handleToggleStudent(student.id)}
                          className={`cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-blue-50 border-blue-500 text-blue-700"
                              : "hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <span className="font-medium truncate mr-2">
                            {student.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                    <p className="text-sm text-gray-500">
                      {selectedStudentIds.length} students selected (showing{" "}
                      {students.length} of {totalStudents})
                    </p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(0, prev - 1))
                          }
                          disabled={currentPage === 0 || fetchingStudents}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <span className="text-sm font-medium text-gray-700 px-2">
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages - 1, prev + 1),
                            )
                          }
                          disabled={
                            currentPage >= totalPages - 1 || fetchingStudents
                          }
                          className="flex items-center gap-1"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  {isClassSelected
                    ? "No students found in this class."
                    : "Select a class to see students."}
                </div>
              )}
            </div>
          )}

          {/* Details Section */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {mode === "create"
                ? "3. Demerit Details"
                : "Edit Demerit Details"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] || cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Points to deducted
                </label>
                <Input
                  type="number"
                  min={5}
                  placeholder="Min. 5"
                  value={formData.point}
                  onChange={(e) =>
                    setFormData({ ...formData, point: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Why are points being given?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  maxLength={300}
                />
                <div className="flex justify-end text-xs text-gray-400">
                  {formData.description.length}/300
                </div>
              </div>

              <div className="space-y-2 w-[150px]">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                loading ||
                (mode === "create" && selectedStudentIds.length === 0)
              }
            >
              {loading ? <Spinner className="mr-2" /> : null}
              {mode === "create"
                ? "Submit Demerit Points"
                : "Update Demerit Point"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
