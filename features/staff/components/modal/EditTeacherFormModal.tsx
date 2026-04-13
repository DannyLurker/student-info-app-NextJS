"use client";

import { Button } from "@/components/ui/button";
import { UserTableData } from "../../types/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { teacherUpdateSchema, TeacherUpdateSchema } from "@/lib/zod/teacher";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Eraser,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CLASS_SECTION,
  ClassSection,
  Grade,
  GRADES,
  Major,
  MAJORS,
} from "@/lib/constants/class";
import { GRADE_DISPLAY_MAP, MAJOR_DISPLAY_MAP } from "@/lib/utils/labels";
import { useSubject } from "@/features/subject/hooks/useSubject";

interface EditTeacherFormModalProps {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
  teacherData: UserTableData;
}

const EditTeacherFormModal = ({
  open,
  onOpenChange,
  teacherData,
}: EditTeacherFormModalProps) => {
  const { data: subjectData, isPending: isSubjectsLoading } = useSubject();
  const {
    register,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm<TeacherUpdateSchema>({
    resolver: zodResolver(teacherUpdateSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearHomeroomClass = () => {
    setValue("homeroomClass.grade", "" as Grade);
    setValue("homeroomClass.major", "" as Major);
    setValue("homeroomClass.section", "" as ClassSection);
  };

  return (
    <>
      <div className="w-full h-full">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-[70vw]">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                Update Teacher Profile
              </DialogTitle>

              <form>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 col-span-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">
                      Personal Information
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <Field data-invalid={!!errors.name}>
                      <FieldLabel>
                        Name <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Input
                        {...register("name")}
                        className="h-11"
                        placeholder="Minumun 3 characters"
                        required
                      />
                      {errors.name && <FieldError errors={[errors.name]} />}
                    </Field>
                  </div>
                  <div className="space-y-2">
                    <Field data-invalid={!!errors.email}>
                      <FieldLabel>
                        Email <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Input
                        {...register("email")}
                        className="h-11"
                        placeholder="Minumun 3 characters"
                        required
                      />
                      {errors.email && <FieldError errors={[errors.email]} />}
                    </Field>
                  </div>
                  <Field data-invalid={!!errors.passwordSchema?.root}>
                    <FieldLabel>Password</FieldLabel>

                    <div className="relative">
                      <Input
                        {...register("passwordSchema.password")}
                        className="h-11 pr-10"
                        placeholder="Minimum 3 characters"
                        type={showPassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {errors.passwordSchema?.root && (
                      <FieldError errors={[errors.passwordSchema?.root]} />
                    )}
                  </Field>

                  <Field data-invalid={!!errors.passwordSchema?.root}>
                    <FieldLabel>Confirm Password</FieldLabel>

                    <div className="relative">
                      <Input
                        {...register("passwordSchema.confirmPassword")}
                        className="h-11 pr-10"
                        placeholder="Minimum 3 characters"
                        type={showConfirmPassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {errors.passwordSchema?.root && (
                      <FieldError errors={[errors.passwordSchema?.root]} />
                    )}
                  </Field>
                  {/* Homeroom Class */}
                  <div className="border-t pt-6 col-span-2">
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
                      <Controller
                        name="homeroomClass.grade"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Grade</FieldLabel>

                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
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

                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="homeroomClass.major"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Major</FieldLabel>

                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select major" />
                              </SelectTrigger>
                              <SelectContent>
                                {MAJORS.map((g) => (
                                  <SelectItem key={g} value={g}>
                                    {MAJOR_DISPLAY_MAP[g]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="homeroomClass.section"
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Class section </FieldLabel>

                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent>
                                {CLASS_SECTION.map((num) => (
                                  <SelectItem key={num} value={num}>
                                    {num === "none" ? "None" : `Class ${num}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  </div>

                  {/* Teaching Assignments */}
                  {/* {subjectData && subjectData.subjects.length !== 0 ? (
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">
                          Teaching Assignments (Optional)
                        </h3>
                        <Button
                          type="button"
                          onClick={addTeachingAssignment}
                          // disabled={isLoading}
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
                                  updateTeachingAssignment(
                                    index,
                                    "subjectName",
                                    v,
                                  )
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
                                    updateTeachingAssignment(
                                      index,
                                      "section",
                                      v,
                                    )
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
                                        {num === "none"
                                          ? "None"
                                          : `Class ${num}`}
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
                        No subjects found. Please create a subject first to
                        enable teaching assignments.
                      </p>
                    </div>
                  )} */}
                </div>
              </form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default EditTeacherFormModal;
