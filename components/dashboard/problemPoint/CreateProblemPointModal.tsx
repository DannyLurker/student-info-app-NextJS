"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import ProblemPointForm from "../ProblemPointForm";
import { Session } from "@/lib/types/session";

interface CreateProblemPointModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: Session;
}

export default function CreateProblemPointModal({
    open,
    onOpenChange,
    session,
}: CreateProblemPointModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Problem Point Record</DialogTitle>
                    <DialogDescription>
                        Assign problem points to students.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <ProblemPointForm session={session} onSuccess={() => onOpenChange(false)} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
