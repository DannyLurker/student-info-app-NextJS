"use client";

import { Grade, Major } from "../../../../lib/constants/class";
import { SubjectType } from "../../../../lib/constants/subject";
import { SUBJECT_KEYS } from "../../../../lib/constants/tanStackQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Checkbox } from "../../../ui/checkbox";
import { Label } from "../../../ui/label";
import { Spinner } from "../../../ui/spinner";
import {
  GRADE_DISPLAY_MAP,
  MAJOR_DISPLAY_MAP,
} from "../../../../lib/utils/labels";
import { Plus, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { CreateSubjectSchema, PatchSubjectSchema } from "@/lib/zod/subject";

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
  initialData?: PatchSubjectSchema;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const SubjectForm = ({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: SubjectFormProps) => {
  const [subjectData, setSubjectData] = useState<CreateSubjectSchema>({
    subjectRecords: [],
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setSubjectData({
        subjectRecords: [
          {
            subjectNames: [initialData.subjectName ?? ""],
            subjectConfig: {
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
      const response = await axios.post("/api/staff/subject", subjectData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.details} has been created`);
      setSubjectData({ subjectRecords: [INITIAL_SUBJECT_RECORD] });
      setErrorMessage("");
      queryClient.invalidateQueries({ queryKey: SUBJECT_KEYS.all });
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      let errorMsg = "Failed to create subject";
      if (err.response?.data?.message) errorMsg = err.response.data.message;
      else if (err.response?.data?.errors?.[0]?.message)
        errorMsg = err.response.data.errors[0].message;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: PatchSubjectSchema) => {
      const response = await axios.patch("/api/staff/subject", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSubjectData({ subjectRecords: [] });
      setErrorMessage("");
      queryClient.invalidateQueries({ queryKey: SUBJECT_KEYS.lists() });
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      let errorMsg = "Failed to update subject";
      if (err.response?.data?.message) errorMsg = err.response.data.message;
      else if (err.response?.data?.errors?.[0]?.message)
        errorMsg = err.response.data.errors[0].message;
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    },
  });

  // ─── Subject Set helpers ──────────────────────────────────────────────────

  const addSubjectSet = () => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: [...prev.subjectRecords, INITIAL_SUBJECT_RECORD],
    }));
  };

  const deleteSubjectSet = (setIndex: number) => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.filter((_, i) => i !== setIndex),
    }));
  };

  // ─── Subject Name helpers ─────────────────────────────────────────────────

  const addExtraSubjectName = (setIndex: number) => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.map((s, i) =>
        i === setIndex ? { ...s, subjectNames: [...s.subjectNames, ""] } : s,
      ),
    }));
  };

  const handleSubjectNameChange = (
    value: string,
    setIndex: number,
    nameIndex: number,
  ) => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.map((s, i) =>
        i === setIndex
          ? {
              ...s,
              subjectNames: s.subjectNames.map((n, ni) =>
                ni === nameIndex ? value : n,
              ),
            }
          : s,
      ),
    }));
  };

  const deleteSubjectName = (setIndex: number, nameIndex: number) => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.map((s, i) =>
        i === setIndex
          ? {
              ...s,
              subjectNames: s.subjectNames.filter((_, ni) => ni !== nameIndex),
            }
          : s,
      ),
    }));
  };

  // ─── Subject Type helper ──────────────────────────────────────────────────

  const handleTypeChange = (setIndex: number, val: SubjectType) => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.map((s, i) => {
        if (i !== setIndex) return s;
        const allowedMajors =
          val === "MAJOR" ? [] : s.subjectConfig.allowedMajors;
        return {
          ...s,
          subjectConfig: { ...s.subjectConfig, type: val, allowedMajors },
        };
      }),
    }));
  };

  // ─── Grade toggle (checkbox) ──────────────────────────────────────────────

  const handleGradeToggle = (setIndex: number, grade: Grade) => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.map((s, i) => {
        if (i !== setIndex) return s;
        const current = s.subjectConfig.allowedGrades;
        const updated = current.includes(grade)
          ? current.filter((g) => g !== grade)
          : [...current, grade];
        return {
          ...s,
          subjectConfig: { ...s.subjectConfig, allowedGrades: updated },
        };
      }),
    }));
  };

  // ─── Major toggle (checkbox) ──────────────────────────────────────────────

  const handleMajorToggle = (setIndex: number, major: Major) => {
    setSubjectData((prev) => ({
      ...prev,
      subjectRecords: prev.subjectRecords.map((s, i) => {
        if (i !== setIndex) return s;
        const current = s.subjectConfig.allowedMajors;
        const isChecked = current.includes(major);
        const updated = isChecked
          ? current.filter((m) => m !== major)
          : [...current, major];
        return {
          ...s,
          subjectConfig: { ...s.subjectConfig, allowedMajors: updated },
        };
      }),
    }));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    setErrorMessage("");

    const isValid = subjectData.subjectRecords.every((subject, index) => {
      if (subject.subjectNames.some((name) => name.trim() === "")) {
        setErrorMessage(`Set ${index + 1}: Names cannot be empty.`);
        return false;
      }
      if (
        subject.subjectConfig.allowedGrades.length === 0 ||
        subject.subjectConfig.allowedMajors.length === 0
      ) {
        setErrorMessage(
          `Set ${index + 1}: Please select at least one Grade and Major.`,
        );
        return false;
      }
      if (
        subject.subjectConfig.allowedMajors.some((m) => !majors.includes(m))
      ) {
        setErrorMessage(
          `Set ${index + 1}: Please select a value for every Major slot.`,
        );
        return false;
      }
      return true;
    });

    if (!isValid) return;

    if (mode === "create") {
      createMutation.mutate();
    } else if (mode === "edit" && initialData) {
      const updatePayload = {
        subjectId: initialData.subjectId,
        subjectName: subjectData.subjectRecords[0].subjectNames[0],
        subjectConfig: subjectData.subjectRecords[0].subjectConfig,
      };
      updateMutation.mutate(updatePayload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
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

      {subjectData.subjectRecords.map((record, setIndex) => {
        const isMajorType = record.subjectConfig.type === "MAJOR";
        return (
          <div
            key={setIndex}
            className="bg-white p-6 rounded-xl border shadow-sm space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === "edit"
                  ? "Edit Subject"
                  : `Subject Set ${setIndex + 1}`}
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
                      handleSubjectNameChange(
                        e.target.value,
                        setIndex,
                        nameIndex,
                      )
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
                onValueChange={(val) =>
                  handleTypeChange(setIndex, val as SubjectType)
                }
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

            {/* Grade Config — Checkboxes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Grade(s)
              </label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {grades.map((gr) => {
                  const checked =
                    record.subjectConfig.allowedGrades.includes(gr);
                  return (
                    <div key={gr} className="flex items-center gap-2">
                      <Checkbox
                        id={`grade-${setIndex}-${gr}`}
                        checked={checked}
                        onCheckedChange={() => handleGradeToggle(setIndex, gr)}
                      />
                      <Label htmlFor={`grade-${setIndex}-${gr}`}>
                        {GRADE_DISPLAY_MAP[gr]}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Major Config — Checkboxes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Major(s)
              </label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {majors.map((major) => {
                  const checked =
                    record.subjectConfig.allowedMajors.includes(major);
                  const atLimit = isMajorType
                    ? record.subjectConfig.allowedMajors.length >= 1 && !checked
                    : record.subjectConfig.allowedMajors.length >= 2 &&
                      !checked;
                  return (
                    <div key={major} className="flex items-center gap-2">
                      <Checkbox
                        id={`major-${setIndex}-${major}`}
                        checked={checked}
                        disabled={atLimit}
                        onCheckedChange={() =>
                          handleMajorToggle(setIndex, major)
                        }
                      />
                      <Label
                        htmlFor={`major-${setIndex}-${major}`}
                        className={atLimit ? "text-gray-400" : ""}
                      >
                        {MAJOR_DISPLAY_MAP[major]}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Subject Set (create mode only) */}
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
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading && <Spinner className="mr-2" />}
          {mode === "edit" ? "Update Subject" : "Create Subjects"}
        </Button>
      </div>
    </div>
  );
};

export default SubjectForm;
