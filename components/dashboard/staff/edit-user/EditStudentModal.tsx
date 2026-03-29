"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { UserDataTable } from "./edit-user-student-table/UserDataTable";
import {
  studentColumns,
  StudentTableData,
} from "./edit-user-student-table/StudentColumns";
import { useClassroom } from "@/services/classroom/classroom-hooks";
import { getFullClassLabel } from "@/lib/utils/labels";
import { ClassSection, Grade, Major } from "@/lib/constants/class";
import { useStudent } from "@/services/student/student-hooks";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditStudentModal = ({ open, onOpenChange }: EditStudentModalProps) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const { data: classroomData } = useClassroom();

  const [grade, major, section] = selectedValue ? selectedValue.split("-") : [];

  console.log(selectedValue);

  const { data: studentData } = useStudent(
    {
      isPaginationActive: false,
      page: 0,
      grade: grade as Grade,
      major: major as Major,
      section: section as ClassSection,
      search: "",
    },
    {
      enabled: !!selectedValue,
    },
  );

  console.log(studentData);

  const transformStudentData: StudentTableData[] =
    studentData?.students && studentData?.students.length > 0
      ? studentData?.students.map((student) => {
          return {
            id: student.user.id,
            name: student.user.name,
            email: student.user.email,
          };
        })
      : [];

  return (
    <div className="w-full h-full">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[70vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Update Student Profile
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 w-full">
            <Select
              value={selectedValue}
              onValueChange={setSelectedValue}
              disabled={classroomData?.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a classroom" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Classes: </SelectLabel>
                  {classroomData?.map((classroom) => (
                    <SelectItem
                      key={classroom.id}
                      value={`${classroom.grade}-${classroom.major}-${classroom.section}`}
                    >
                      {getFullClassLabel(
                        classroom.grade,
                        classroom.major,
                        classroom.section as ClassSection,
                      )}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button className="w-full">Advance Class</Button>
          </div>

          <UserDataTable columns={studentColumns} data={transformStudentData} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditStudentModal;
