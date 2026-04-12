import { UserTableData } from "../../types/user";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";

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
  const { register } = useForm();

  return (
    <>
      <div className="w-full h-full">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-[70vw]">
            <DialogHeader>
              <DialogTitle className="text-center 2xl">
                Update Teacher Profile
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default EditTeacherFormModal;
