"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import ProblemPointManagement from "./ProblemPointManagement";

interface ManageProblemPointModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: any;
}

export default function ManageProblemPointModal({
    open,
    onOpenChange,
    session,
}: ManageProblemPointModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Problem Points</DialogTitle>
                    <DialogDescription>
                        View, update, or delete existing problem point records.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <ProblemPointManagement session={session} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
