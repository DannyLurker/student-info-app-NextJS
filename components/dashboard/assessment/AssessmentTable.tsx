import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface Mark {
    assessmentNumber: number;
    score: number | null;
    type: string;
    description: {
        detail: string;
        dueAt: string;
        givenAt: string;
    };
}

interface MarkTableProps {
    marks: Mark[];
    page: number;
    hasMore: boolean;
    onPageChange: (newPage: number) => void;
    isLoading?: boolean;
}

const MarkTable = ({ marks, page, hasMore, onPageChange, isLoading }: MarkTableProps) => {
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
                                    <TableCell>{mark.assessmentNumber}</TableCell>
                                    <TableCell>{mark.type}</TableCell>
                                    <TableCell>{mark.description.detail}</TableCell>
                                    <TableCell>
                                        {mark.description.givenAt
                                            ? formatWIB(mark.description.givenAt)
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {mark.description.dueAt
                                            ? formatWIB(mark.description.dueAt)
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
