"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import ManageSubjectForm from "./ManageSubjectForm";

interface ManageSubjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ManageSubjectModal({
    open,
    onOpenChange,
}: ManageSubjectModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Subjects</DialogTitle>
                    <DialogDescription>
                        View, update, or delete existing subjects.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <ManageSubjectForm />
                </div>
            </DialogContent>
        </Dialog>
    );
}
