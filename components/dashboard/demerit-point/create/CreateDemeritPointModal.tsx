"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/dialog";
import DemeritPointForm from "./DemeritPointForm";

interface CreateDemeritPointModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateDemeritPointModal({
  open,
  onOpenChange,
}: CreateDemeritPointModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Demerit Point Record</DialogTitle>
          <DialogDescription>
            Assign demerit points to students.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <DemeritPointForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
