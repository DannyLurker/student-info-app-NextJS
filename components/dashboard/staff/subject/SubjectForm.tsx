"use client";

import { Grade, Major } from "@/lib/constants/class";
import { SubjectType } from "@/lib/constants/subject";
import { SUBJECT_KEYS } from "@/lib/constants/tanStackQueryKeys";
import { CreateSubjectInput, PatchSubjectInput } from "@/lib/utils/zodSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { GRADE_DISPLAY_MAP, MAJOR_DISPLAY_MAP } from "@/lib/utils/labels";
import { Plus, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";

type ConfigType = "MAJOR" | "GRADE";

const grades = ["TENTH", "ELEVENTH", "TWELFTH"] as Grade[];
const majors = ["SOFTWARE_ENGINEERING", "ACCOUNTING"] as Major[];
const subjectTypes = ["GENERAL", "MAJOR"] as SubjectType[];

const INITIAL_SUBJECT_RECORD = {
  subjectNames: [""],
  subjectConfig: {
    allowedGrades: [] as Grade[],
    allowedMajors: [] as Major[],
    type: "GENERAL" as SubjectType,
  },
};

type SubjectFormProps = {
  mode?: "create" | "edit";
  initialData?: PatchSubjectInput;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const SubjectForm = ({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: SubjectFormProps) => {
  //  State management
  const [subjectData, setSubjectData] = useState<CreateSubjectInput>({
    subjectRecords: [],
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setSubjectData({
        subjectRecords: [
          {
            // Gunakan ?? "" untuk memastikan subjectNames selalu berisi string
            subjectNames: [initialData.subjectName ?? ""],

            subjectConfig: {
              // Berikan fallback untuk setiap properti di dalam config
              allowedGrades: initialData.subjectConfig?.allowedGrades ?? [],
              allowedMajors: initialData.subjectConfig?.allowedMajors ?? [],
              type: initialData.subjectConfig?.type ?? "GENERAL",
            },
          },
        ],
      });
    } else if (mode === "create") {
      setSubjectData({ subjectRecords: [INITIAL_SUBJECT_RECORD] });
    }
  }, [mode, initialData]);

  const [errorMessage, setErrorMessage] = useState("");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      // Jangan wrap dengan toast.promise di sini
      const response = await axios.post("/api/staff/subject", subjectData);
      return response.data;
    },
    onSuccess: (data) => {
      // Success handling
      toast.success(`${data.details} has been created`);
      setSubjectData({ subjectRecords: [INITIAL_SUBJECT_RECORD] });
      setErrorMessage(""); // Clear error
      queryClient.invalidateQueries({ queryKey: SUBJECT_KEYS.lists() });
      if (onSuccess) onSuccess(); // Tutup modal di sini
    },
    onError: (err: any) => {
      // Error handling
      let errorMsg = "Failed to create subject";

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors?.[0]?.message) {
        errorMsg = err.response.data.errors[0].message;
      }

      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: PatchSubjectInput) => {
      const response = await axios.patch("/api/staff/subject", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSubjectData({ subjectRecords: [] });
      setErrorMessage("");
      queryClient.invalidateQueries({ queryKey: SUBJECT_KEYS.lists() });
      if (onSuccess) onSuccess(); // Tutup modal di sini
    },
    onError: (err: any) => {
      let errorMsg = "Failed to update subject";

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors?.[0]?.message) {
        errorMsg = err.response.data.errors[0].message;
      }

      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    },
  });

  const addSubjectSet = () => {
    setSubjectData((prev) => {
      // If prev is undefined, we create the initial object
      if (!prev) {
        return { subjectRecords: [INITIAL_SUBJECT_RECORD] };
      }

      return {
        ...prev,
        subjectRecords: [...prev.subjectRecords, INITIAL_SUBJECT_RECORD],
      };
    });
  };

  const addExtraSubjectName = (subjectSetIndex: number) => {
    setSubjectData((prev) => {
      if (!prev) return prev;

      const updatedSubjectRecords = prev.subjectRecords.map(
        (subject, index) => {
          if (index === subjectSetIndex) {
            return {
              ...subject,
              subjectNames: [...subject.subjectNames, ""],
            };
          }
          return subject;
        },
      );

      return {
        ...prev,
        subjectRecords: updatedSubjectRecords,
      };
    });
  };

  const addExtraSubjectConfig = (
    subjectSetIndex: number,
    configType: ConfigType,
  ) => {
    setSubjectData((prev) => {
      if (!prev) return prev;

      const updatedSubjectRecords = prev.subjectRecords.map(
        (subject, index) => {
          if (index === subjectSetIndex) {
            const majorLimitReached =
              configType === "MAJOR" && subject.subjectConfig.allowedMajors.length < 3;

            const gradeLimitReached =
              configType === "GRADE" && subject.subjectConfig.allowedGrades.length < 4;

            return {
              ...subject,
              subjectConfig: {
                allowedMajors: majorLimitReached
                  ? ([...subject.subjectConfig.allowedMajors, ""] as Major[])
                  : ([...subject.subjectConfig.allowedMajors] as Major[]),
                allowedGrades: gradeLimitReached
                  ? ([...subject.subjectConfig.allowedGrades, ""] as Grade[])
                  : ([...subject.subjectConfig.allowedGrades] as Grade[]),
                type: subject.subjectConfig.type as SubjectType,
              },
            };
          }
          return subject;
        },
      );

      return {
        ...prev,
        subjectRecords: updatedSubjectRecords,
      };
    });
  };

  const handleSubjectNameChange = (
    e: ChangeEvent<HTMLInputElement>,
    subjectSetIndex: number,
    subjectNameIndex: number,
  ) => {
    setSubjectData((prev) => {
      const updatedSubjectRecords = prev.subjectRecords.map(
        (subject, index) => {
          if (index === subjectSetIndex) {
            return {
              ...subject,
              subjectNames: subject.subjectNames.map((name, nameIndex) => {
                if (subjectNameIndex === nameIndex) {
                  name = e.target.value;
                }
                return name;
              }),
            };
          }

          return subject;
        },
      );

      return {
        ...prev,
        subjectRecords: updatedSubjectRecords,
      };
    });
  };

  const handleSubjectConfigChange = (
    e: ChangeEvent<HTMLInputElement>,
    subjectSetIndex: number,
    configType: ConfigType,
    subjectConfigIndex: number,
  ) => {
    const key = configType === "GRADE" ? "allowedGrades" : "allowedMajors";

    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.map((subject, sIdx) =>
        sIdx === subjectSetIndex
          ? {
            ...subject,
            subjectConfig: {
              ...subject.subjectConfig,
              [key]: subject.subjectConfig[key].map((val, cIdx) =>
                cIdx === subjectConfigIndex ? e.target.value : val,
              ),
            },
          }
          : subject,
      ),
    }));
  };

  const deleteSubjectConfig = (
    subjectSetIndex: number,
    configType: ConfigType,
    subjectConfigIndex: number,
  ) => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.map((subject, index) => {
        if (index === subjectSetIndex) {
          const key = configType === "GRADE" ? "allowedGrades" : "allowedMajors";
          return {
            ...subject,
            subjectConfig: {
              ...subject.subjectConfig,
              [key]: subject.subjectConfig[key].filter(
                (_, i) => i !== subjectConfigIndex,
              ),
            },
          };
        }
        return subject;
      }),
    }));
  };

  const deleteSubjectSet = (subjectSetIndex: number) => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.filter(
        (_, index) => index !== subjectSetIndex,
      ),
    }));
  };

  const deleteSubjectName = (
    subjectSetIndex: number,
    subjectNameIndex: number,
  ) => {
    setSubjectData((prev) => {
      if (!prev) return prev;
      const newRecords = prev.subjectRecords.map((record, index) => {
        if (index === subjectSetIndex) {
          // We return a copy of the record with a FILTERED name array
          return {
            ...record,
            subjectNames: record.subjectNames.filter(
              (_, i) => i !== subjectNameIndex,
            ),
          };
        }
        return record;
      });

      return {
        ...prev,
        subjectRecords: newRecords,
      };
    });
  };

  const handleSubmit = () => {
    setErrorMessage("");

    // ALl data must be filled
    const isValid = subjectData.subjectRecords.every((subject, index) => {
      // Check names
      if (subject.subjectNames.some((name) => name.trim() === "")) {
        setErrorMessage(`Set ${index + 1}: Names cannot be empty.`);
        return false;
      }
      // Check config
      if (
        subject.subjectConfig.allowedGrades.length === 0 ||
        subject.subjectConfig.allowedMajors.length === 0
      ) {
        setErrorMessage(
          `Set ${index + 1}: Please select at least one Grade and Major.`,
        );
        return false;
      }
      return true;
    });

    // Gunakan logic validation yang sudah kamu buat (isValid)
    if (!isValid) return;

    if (mode === "create") {
      createMutation.mutate();
    } else if (mode === "edit" && initialData) {
      // Pastikan payload update menyertakan ID yang ingin diubah
      const updatePayload = {
        subjectId: initialData.subjectId,
        subjectName: subjectData.subjectRecords[0].subjectNames[0],
        subjectConfig: subjectData.subjectRecords[0].subjectConfig,
      };
      updateMutation.mutate(updatePayload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Error Message */}

      {isLoading &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center">
            <Spinner />
          </div>,
          document.body,
        )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* Subject Sets */}
      {subjectData.subjectRecords.map((record, setIndex) => (
        <div
          key={setIndex}
          className="bg-white p-6 rounded-xl border shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {mode === "edit" ? "Edit Subject" : `Subject Set ${setIndex + 1}`}
            </h3>
            {mode === "create" && subjectData.subjectRecords.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => deleteSubjectSet(setIndex)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Subject Names */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600">
              Subject Name(s)
            </label>
            {record.subjectNames.map((name, nameIndex) => (
              <div key={nameIndex} className="flex items-center gap-2">
                <Input
                  placeholder="Enter subject name..."
                  value={name}
                  onChange={(e) =>
                    handleSubjectNameChange(e, setIndex, nameIndex)
                  }
                />
                {mode === "create" && record.subjectNames.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={() => deleteSubjectName(setIndex, nameIndex)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {mode === "create" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addExtraSubjectName(setIndex)}
                className="flex items-center gap-1 text-xs"
              >
                <Plus className="w-3 h-3" />
                Add Name
              </Button>
            )}
          </div>

          {/* Subject Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Subject Type
            </label>
            <Select
              value={record.subjectConfig.type}
              onValueChange={(val) => {
                setSubjectData((prev) => ({
                  ...prev,
                  subjectRecords: prev.subjectRecords.map((s, i) =>
                    i === setIndex
                      ? {
                        ...s,
                        subjectConfig: {
                          ...s.subjectConfig,
                          type: val as SubjectType,
                        },
                      }
                      : s,
                  ),
                }));
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {subjectTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Config */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600">
              Grade(s)
            </label>
            {record.subjectConfig.allowedGrades.map((g, gIdx) => (
              <div key={gIdx} className="flex items-center gap-2">
                <Select
                  value={g}
                  onValueChange={(val) => {
                    const e = {
                      target: { value: val },
                    } as ChangeEvent<HTMLInputElement>;
                    handleSubjectConfigChange(e, setIndex, "GRADE", gIdx);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((gr) => (
                      <SelectItem key={gr} value={gr}>
                        {GRADE_DISPLAY_MAP[gr]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {record.subjectConfig.allowedGrades.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={() => deleteSubjectConfig(setIndex, "GRADE", gIdx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {record.subjectConfig.allowedGrades.length < 3 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addExtraSubjectConfig(setIndex, "GRADE")}
                className="flex items-center gap-1 text-xs"
              >
                <Plus className="w-3 h-3" />
                Add Grade
              </Button>
            )}
          </div>

          {/* Major Config */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600">
              Major(s)
            </label>
            {record.subjectConfig.allowedMajors.map((m, mIdx) => (
              <div key={mIdx} className="flex items-center gap-2">
                <Select
                  value={m}
                  onValueChange={(val) => {
                    const e = {
                      target: { value: val },
                    } as ChangeEvent<HTMLInputElement>;
                    handleSubjectConfigChange(e, setIndex, "MAJOR", mIdx);
                  }}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((mj) => (
                      <SelectItem key={mj} value={mj}>
                        {MAJOR_DISPLAY_MAP[mj]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {record.subjectConfig.allowedMajors.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={() => deleteSubjectConfig(setIndex, "MAJOR", mIdx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {record.subjectConfig.allowedMajors.length < 2 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addExtraSubjectConfig(setIndex, "MAJOR")}
                className="flex items-center gap-1 text-xs"
              >
                <Plus className="w-3 h-3" />
                Add Major
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Add Subject Set Button (Create mode only) */}
      {mode === "create" && (
        <Button
          type="button"
          variant="outline"
          onClick={addSubjectSet}
          className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-gray-700 hover:border-gray-400"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Another Subject Set
        </Button>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {isLoading && <Spinner className="mr-2" />}
          {mode === "edit" ? "Update Subject" : "Create Subjects"}
        </Button>
      </div>
    </div>
  );
};

export default SubjectForm;
