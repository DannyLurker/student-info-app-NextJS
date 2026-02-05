import { Grade, Major } from "../constants/class";
import { SubjectType } from "../constants/subject";

export type Subject = {
  id?: number;
  subjectName: string;
  students?: [];
  teachingAssignment?: [];
};

export type SubjectConfig = {
  grade: Grade[];
  major: Major[];
  subjectType: SubjectType;
};
