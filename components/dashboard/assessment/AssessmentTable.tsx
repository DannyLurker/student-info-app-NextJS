import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Button } from "../../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { AssessmentType } from "../../../lib/constants/assessments";
interface AssessmentScore {
  score: number;
  assessment: {
    givenAt: string;
    dueAt: string;
    title: string;
    type: AssessmentType;
  };
}

interface AssessmentTableProps {
  marks: AssessmentScore[];
  page: number;
  hasMore: boolean;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

const MarkTable = ({
  marks,
  page,
  hasMore,
  onPageChange,
  isLoading,
}: AssessmentTableProps) => {
  const formatWIB = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      dateStyle: "long",
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assessment #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead>Given At</TableHead>
              <TableHead>Due At</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No marks found for this subject.
                </TableCell>
              </TableRow>
            ) : (
              marks.map((mark, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{mark.assessment.type}</TableCell>
                  <TableCell>{mark.assessment.title}</TableCell>
                  <TableCell>
                    {mark.assessment.givenAt
                      ? formatWIB(mark.assessment.givenAt)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {mark.assessment.dueAt
                      ? formatWIB(mark.assessment.dueAt)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {mark.score !== null ? mark.score : ""}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0 || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm font-medium">Page {page + 1}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasMore || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default MarkTable;
