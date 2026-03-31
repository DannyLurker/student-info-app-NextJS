import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  userId: string;
}

const DeleteUserModal = ({
  open,
  onOpenChange,
  username,
  userId,
}: DeleteUserModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you absolutely sure to delete {username}'s account?
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserModal;
