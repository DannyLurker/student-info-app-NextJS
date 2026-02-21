"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/dialog";
import SubjectForm from "./SubjectForm";

interface CreateSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateSubjectModal({
  open,
  onOpenChange,
}: CreateSubjectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Subject</DialogTitle>
          <DialogDescription>
            Add new subjects with their grade, major, and type configurations.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <SubjectForm mode="create" onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
