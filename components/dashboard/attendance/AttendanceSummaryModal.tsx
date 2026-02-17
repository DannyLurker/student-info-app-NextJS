"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import AttendanceSummary from "./AttendanceSummary";
import { Session } from "@/lib/types/session";
import { getFullClassLabel } from "@/lib/utils/labels";
import { ClassSection, Grade, Major } from "@/lib/constants/class";

interface AttendanceSummaryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session;
}

const AttendanceSummaryModal = ({
  isOpen,
  onOpenChange,
  session,
}: AttendanceSummaryModalProps) => {
  const [homeroomClass, setHomeroomClass] = useState({
    grade: "",
    major: "",
    section: "",
  });

  const classLabel = getFullClassLabel(
    homeroomClass.grade as Grade,
    homeroomClass.major as Major,
    homeroomClass.section as ClassSection,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl lg:max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Student Attendance Summary | {classLabel}
          </DialogTitle>
        </DialogHeader>

        {/* Main */}
        <AttendanceSummary
          session={session}
          setHomeroomClass={setHomeroomClass}
        />

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceSummaryModal;
