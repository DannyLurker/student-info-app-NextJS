"use client";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "../../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  ChangeEvent,
  FormEvent,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import axios from "axios";
import {
  Upload,
  UserPlus,
  FileSpreadsheet,
  GraduationCap,
  Plus,
  Trash2,
  BookOpen,
  Eraser,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "../../ui/spinner";
import {
  GRADE_DISPLAY_MAP,
  MAJOR_DISPLAY_MAP,
} from "../../../lib/utils/labels";

import { CLASS_SECTION, GRADES, MAJORS } from "../../../lib/constants/class";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SUBJECT_KEYS,
  TEACHER_KEYS,
} from "../../../lib/constants/tanStackQueryKeys";
import {
  TeacherSignUpSchema,
  TeachingAssignmentInput,
} from "../../../lib/utils/zodSchema";
import { getErrorMessage } from "../../../lib/utils/getErrorMessage";
import {
  ALLOWED_EXTENSIONS,
  AllowedExtensions,
} from "../../../lib/constants/allowedExtensions";
import { createPortal } from "react-dom";

type GroupedSubjects = Record<string, any[]>;

const groupSubjects = (subjects: any[]): GroupedSubjects => {
  const grouped: GroupedSubjects = {
    general: [],
    accounting: [],
    software_engineering: [],
  };

  subjects.forEach((subject) => {
    if (subject.subjectConfig.type === "GENERAL") {
      grouped.general.push(subject);
    } else if (
      subject.subjectConfig.type === "MAJOR" &&
      subject.subjectConfig.allowedMajors.includes("ACCOUNTING")
    ) {
      grouped.accounting.push(subject);
    } else if (
      subject.subjectConfig.type === "MAJOR" &&
      subject.subjectConfig.allowedMajors.includes("SOFTWARE_ENGINEERING")
    ) {
      grouped.software_engineering.push(subject);
    }
  });

  return grouped;
};

interface TeachingAssignment {
  subjectName: string;
  grade: string;
  major: string;
  section: string;
}

interface TeacherFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TeacherFormModal = ({ open, onOpenChange }: TeacherFormModalProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Homeroom Class
  const [homeroomClass, setHomeroomClass] = useState({
    grade: "",
    major: "",
    section: "",
  });

  // Teaching Assignments - multiple
  const [teachingAssignments, setTeachingAssignments] = useState<
    TeachingAssignment[]
  >([]);

  const queryClient = useQueryClient();

  // Fetch subjects
  const { data: subjectsData, isLoading: isSubjectsLoading } = useQuery({
    queryKey: SUBJECT_KEYS.listsAll(),
    queryFn: async () => {
      const res = await axios.get("/api/staff/subject", {
        params: {
          getAll: "true",
          sortOrder: "asc",
        },
      });
      return res.data.subjects;
    },
    enabled: open, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const availableSubjects = Array.isArray(subjectsData) ? subjectsData : [];
  const sortedAndGroupedSubjects = useMemo(() => {
    return groupSubjects(availableSubjects);
  }, [availableSubjects]);

  const singleMutation = useMutation({
    mutationFn: (teacherData: TeacherSignUpSchema) => {
      return axios.post(
        "/api/auth/account/single/teacher-account",
        teacherData,
      );
    },
    onSuccess: (res) => {
      toast.success("Teacher account created successfully!");
      // automatic refresh teachers table in background if needed
      queryClient.invalidateQueries({ queryKey: TEACHER_KEYS.all });

      setTimeout(() => {
        resetForm();
      }, 500); // Small delay for better UX
    },
    onError: async (err: any) => {
      const message = await getErrorMessage(err);
      setErrorMessage(message);
      toast.error("Registration failed. Read the message above");
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "/api/auth/account/bulk/teacher-accounts",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setUploadedFile("");
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: async (err: any) => {
      const message = await getErrorMessage(err);
      setErrorMessage(message);
      toast.error("Something went wrong. Read the message above");
      setUploadedFile("");
      if (fileRef.current) fileRef.current.value = "";
    },
  });

  const resetForm = () => {
    setData({ username: "", email: "", password: "", confirmPassword: "" });
    setHomeroomClass({ grade: "", major: "", section: "" });

    setTeachingAssignments([]);
    setErrorMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
      singleMutation.reset();
      bulkMutation.reset();
    }
  }, [open]);

  const clearHomeroomClass = () => {
    setHomeroomClass({ grade: "", major: "", section: "" });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const addTeachingAssignment = () => {
    setTeachingAssignments([
      ...teachingAssignments,
      { subjectName: "", grade: "", major: "", section: "" },
    ]);
  };

  const removeTeachingAssignment = (index: number) => {
    setTeachingAssignments(teachingAssignments.filter((_, i) => i !== index));
  };

  const updateTeachingAssignment = (
    index: number,
    field: keyof TeachingAssignment,
    value: string,
  ) => {
    const updated = [...teachingAssignments];
    updated[index][field] = value;
    setTeachingAssignments(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Filter and map assignments
    // We need subject Id for the payload, but we store subjectName in state
    let validAssignments: TeachingAssignmentInput[] = [];
    let assignmentErrors = false;

    // Check incomplete assignments
    const completeAssignmentsState = teachingAssignments.filter(
      (ta) => ta.subjectName && ta.grade && ta.major && ta.section,
    );

    if (completeAssignmentsState.length !== teachingAssignments.length) {
      setErrorMessage(
        "Please complete all teaching assignments or remove incomplete ones",
      );
      toast.error(
        "Please complete all teaching assignments or remove incomplete ones",
      );
      return;
    }

    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    // Map to Zod Schema structure
    try {
      validAssignments = teachingAssignments.reduce((acc, curr) => {
        // Find subject ID from the loaded subjects
        const subject = availableSubjects.find(
          (s: any) => s.subjectName === curr.subjectName,
        );

        if (!subject) {
          // Should not happen if selected from dropdown
          assignmentErrors = true;
          return acc;
        }

        acc.push({
          subjectId: subject.id,
          subjectName: curr.subjectName,
          grade: curr.grade as any,
          major: curr.major as any,
          section: curr.section as any,
        });

        return acc;
      }, [] as TeachingAssignmentInput[]);
    } catch (e) {
      console.error(e);
      toast.error("Error processing assignments");
      return;
    }

    if (assignmentErrors) {
      toast.error("Invalid subject selected");
      return;
    }

    const payload: TeacherSignUpSchema = {
      username: data.username,
      email: data.email,
      passwordSchema: {
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      homeroomClass:
        homeroomClass.grade && homeroomClass.major
          ? (homeroomClass as any)
          : undefined,
      assignments: validAssignments.length > 0 ? validAssignments : undefined,
    };

    singleMutation.mutate(payload);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (
      !extension ||
      !ALLOWED_EXTENSIONS.includes(extension as AllowedExtensions)
    ) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setUploadedFile(file.name);
    setErrorMessage("");
    bulkMutation.mutate(file);
  };

  const isLoading = singleMutation.isPending || bulkMutation.isPending;

  return (
    <>
      {isLoading &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center">
            <Spinner />
          </div>,
          document.body,
        )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <GraduationCap className="w-8 h-8" />
              Teacher Registration
            </DialogTitle>
          </DialogHeader>

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

          <div className="space-y-6">
            {/* Excel Upload Section */}
            <div className="border rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white mb-3 shadow-lg">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Quick Import
                </h3>
                <p className="text-gray-600 text-sm">
                  Upload Excel file for bulk registration
                </p>
              </div>

              <div className="relative group">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-400 transition-all text-center">
                  <label
                    htmlFor="teacher-excel-file"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-green-600 mb-2" />
                    <span className="text-sm font-semibold text-gray-800">
                      {uploadedFile || "Click to upload Excel file"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Supported: .xlsx, .xls
                    </span>
                  </label>
                  <input
                    ref={fileRef}
                    id="teacher-excel-file"
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm font-semibold text-gray-500 uppercase">
                  Or Register Manually
                </span>
              </div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Personal Information
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="username"
                      placeholder="Enter username"
                      type="text"
                      minLength={3}
                      required
                      disabled={isLoading}
                      onChange={handleChange}
                      value={data.username}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="email"
                      placeholder="your.email@example.com"
                      type="email"
                      required
                      disabled={isLoading}
                      onChange={handleChange}
                      value={data.email}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        name="password"
                        placeholder="Minimum 8 characters"
                        type={showPassword ? "text" : "password"}
                        minLength={8}
                        required
                        disabled={isLoading}
                        onChange={handleChange}
                        value={data.password}
                        className="h-11 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        type={showConfirmPassword ? "text" : "password"}
                        minLength={8}
                        required
                        disabled={isLoading}
                        onChange={handleChange}
                        value={data.confirmPassword}
                        className="h-11 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Homeroom Class */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Homeroom Class (Optional)
                  </h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={clearHomeroomClass}
                  >
                    <Eraser className="w-4 h-4 mr-1" /> Clear
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Select
                    onValueChange={(v) =>
                      setHomeroomClass({ ...homeroomClass, grade: v })
                    }
                    value={homeroomClass.grade}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select grade" />
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
                    onValueChange={(v) =>
                      setHomeroomClass({ ...homeroomClass, major: v })
                    }
                    value={homeroomClass.major}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select major" />
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
                    onValueChange={(v) =>
                      setHomeroomClass({ ...homeroomClass, section: v })
                    }
                    value={homeroomClass.section}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_SECTION.map((num) => (
                        <SelectItem key={num} value={num}>
                          {num === "none" ? "None" : `Class ${num}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Teaching Assignments */}
              {availableSubjects.length !== 0 ? (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Teaching Assignments (Optional)
                    </h3>
                    <Button
                      type="button"
                      onClick={addTeachingAssignment}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Assignment
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {teachingAssignments.map((ta, index) => (
                      <div
                        key={index}
                        className="bg-purple-50 p-4 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
                            <span className="font-semibold text-gray-700">
                              Assignment #{index + 1}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTeachingAssignment(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <Select
                            onValueChange={(v) =>
                              updateTeachingAssignment(index, "subjectName", v)
                            }
                            value={ta.subjectName}
                            disabled={isLoading || isSubjectsLoading}
                          >
                            <SelectTrigger className="h-11 bg-white">
                              <SelectValue
                                placeholder={
                                  isSubjectsLoading
                                    ? "Loading subjects..."
                                    : "Select subject"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(sortedAndGroupedSubjects).map(
                                ([categoryName, subjectList]) =>
                                  subjectList.length > 0 && (
                                    <SelectGroup key={categoryName}>
                                      <SelectLabel>
                                        {categoryName === "general"
                                          ? "General Subjects"
                                          : categoryName === "accounting"
                                            ? "Accounting Subjects"
                                            : "Software Engineering Subjects"}
                                      </SelectLabel>
                                      {subjectList.map((subject: any) => (
                                        <SelectItem
                                          key={subject.id}
                                          value={subject.subjectName}
                                        >
                                          {subject.subjectName}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  ),
                              )}
                            </SelectContent>
                          </Select>

                          <div className="grid md:grid-cols-3 gap-3">
                            <Select
                              onValueChange={(v) =>
                                updateTeachingAssignment(index, "grade", v)
                              }
                              value={ta.grade}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue placeholder="Select grade" />
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
                              onValueChange={(v) =>
                                updateTeachingAssignment(index, "major", v)
                              }
                              value={ta.major}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue placeholder="Select major" />
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
                              onValueChange={(v) =>
                                updateTeachingAssignment(index, "section", v)
                              }
                              value={ta.section}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {CLASS_SECTION.map((num) => (
                                  <SelectItem key={num} value={num}>
                                    {num === "none" ? "None" : `Class ${num}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {teachingAssignments.length === 0 && (
                      <p className="text-center py-4 text-gray-500">
                        No teaching assignments added.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center w-full h-full border-t-2 pt-2">
                  <p className="text-center text-muted-foreground">
                    No subjects found. Please create a subject first to enable
                    teaching assignments.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Teacher Account
                  </span>
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeacherFormModal;
