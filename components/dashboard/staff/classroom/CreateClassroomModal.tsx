"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import ClassroomForm from "./ClassroomForm";

interface CreateClassroomModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateClassroomModal({
    open,
    onOpenChange,
}: CreateClassroomModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Classroom</DialogTitle>
                    <DialogDescription>
                        Add a new classroom and optionally assign a homeroom teacher.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <ClassroomForm mode="create" onSuccess={() => onOpenChange(false)} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
