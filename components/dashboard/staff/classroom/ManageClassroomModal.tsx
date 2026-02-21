"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/dialog";
import ManageClassroomForm from "./ManageClassroomForm";

interface ManageClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageClassroomModal({
  open,
  onOpenChange,
}: ManageClassroomModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Classrooms</DialogTitle>
          <DialogDescription>
            View, update, or delete existing classrooms.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ManageClassroomForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
