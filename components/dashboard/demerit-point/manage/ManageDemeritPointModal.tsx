"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";
import DemeritPointManagement from "./DemeritPointManagement";

interface ManageDemeritPointModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageDemeritPointModal({
  open,
  onOpenChange,
}: ManageDemeritPointModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Demerit Points</DialogTitle>
          <DialogDescription>
            View, update, or delete existing demerit point records.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <DemeritPointManagement />
        </div>
      </DialogContent>
    </Dialog>
  );
}
