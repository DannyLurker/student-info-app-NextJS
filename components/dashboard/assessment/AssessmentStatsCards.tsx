import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { BookOpen, FileText } from "lucide-react";
import React from "react";

interface AssessmentStatsCardsProps {
  subjectName: string;
  totalAssignments: number;
}

const AssessmentStatsCards = ({
  subjectName,
  totalAssignments,
}: AssessmentStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subject Name</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {subjectName || "No Subject Selected"}
          </div>
          <p className="text-xs text-muted-foreground">
            Current viewing subject
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Assignments
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAssignments}</div>
          <p className="text-xs text-muted-foreground">Recorded assignments</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentStatsCards;
