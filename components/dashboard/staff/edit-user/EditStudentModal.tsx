"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { UserDataTable } from "./edit-user-student-table/UserDataTable";
import {
  studentColumns,
  StudentTableData,
} from "./edit-user-student-table/StudentColumns";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const studentTableData: StudentTableData[] = [
  {
    email: "m@example.com",
    name: "Danny",
    class: "11 RPL",
  },
  {
    email: "example@gmail.com",
    name: "Lanny",
    class: "11 RPL",
  },
  {
    email: "example@gmail.com",
    name: "Fanny",
    class: "11 RPL",
  },
];

const EditStudentModal = ({ open, onOpenChange }: EditStudentModalProps) => {
  return (
    <div className="w-full h-full">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[70vw]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Update Student Profile
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <UserDataTable columns={studentColumns} data={studentTableData} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditStudentModal;
