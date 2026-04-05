"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClassroomWithTeacher } from "@/services/classroom/classroom-definitions";
import {
  SelectGroup,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { getFullClassLabel } from "@/lib/utils/labels";
import { ClassSection } from "@/lib/constants/class";

interface AdvanceClassModalProps {
  open: boolean;
  onOpenChange: (bool: boolean) => void;
  classroomData: ClassroomWithTeacher[] | undefined;
  currentClassroom: string | undefined;
}

const AdvanceClassModal = ({
  open,
  onOpenChange,
  classroomData,
  currentClassroom,
}: AdvanceClassModalProps) => {
  const [selectedClassroom, setSelectedClassroom] = useState<string>(
    currentClassroom ?? "",
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <form>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Advance Class</DialogTitle>
              <DialogDescription>
                After student(s) get class advancement, all of the student
                assessments data will be deleted
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label htmlFor="select-classroom">Select Classroom</Label>
                <Select
                  value={selectedClassroom}
                  onValueChange={setSelectedClassroom}
                  disabled={classroomData?.length === 0}
                  name="select-classroom"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a classroom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Classes: </SelectLabel>
                      {classroomData?.map((classroom) => (
                        <SelectItem
                          key={classroom.id}
                          value={`${classroom.grade}-${classroom.major}-${classroom.section}`}
                        >
                          {getFullClassLabel(
                            classroom.grade,
                            classroom.major,
                            classroom.section as ClassSection,
                          )}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};

export default AdvanceClassModal;
