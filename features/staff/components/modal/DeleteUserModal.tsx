import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteStudent } from "@/hooks/user-hooks";
import { useDeleteTeacher } from "@/features/teacher/hooks/useTeachers";
import LoadingFullScreen from "@/components/ui/LoadingFullScreen";

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  userId: string;
  userType: "STUDENT" | "STAFF";
}

const DeleteUserModal = ({
  open,
  onOpenChange,
  username,
  userId,
  userType,
}: DeleteUserModalProps) => {
  const deleteStudentMutation = useDeleteStudent();
  const deleteTeacherMutation = useDeleteTeacher();

  const handleDeleteUser = () => {
    if (userType === "STUDENT") {
      deleteStudentMutation.mutate(userId);
    }

    if (userType === "STAFF") {
      deleteTeacherMutation.mutate(userId);
    }

    onOpenChange(false);
  };

  return (
    <>
      {deleteStudentMutation.isPending ||
        (deleteTeacherMutation.isPending && <LoadingFullScreen />)}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader className="gap-2">
            <DialogTitle className="max-w-[80%]">
              Are you absolutely sure to delete {username}'s account?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <Button
            variant={"destructive"}
            className="w-fit mx-auto"
            onClick={handleDeleteUser}
          >
            Delete
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteUserModal;
