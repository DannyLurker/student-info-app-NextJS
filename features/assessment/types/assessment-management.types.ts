import { AssessmentType } from "../../../lib/constants/assessments";

export interface AssessmentScore {
  student: {
    user: {
      id: string;
      name: string;
    };
  };
  id: string;
  score: number;
}

export interface Assessment {
  id: string;
  teachingAssignmentId: string;
  title: string;
  givenAt: string;
  dueAt: string;
  type: string;
  createdAt: Date;
  scores: AssessmentScore[];
}

/** Flattened per-student row for table rendering & dirty tracking */
export interface StudentRow {
  studentId: string;
  studentName: string;
  marks: {
    assessmentId: string;
    assessmentScoreId: string;
    teachingAssignmentId: string;
    createdAt: Date;
    score: number | 0;
    type: string;
    title: string;
    givenAt: string;
    dueAt: string;
  }[];
}

export interface TeachingAssignment {
  class: {
    id: string;
    grade: string;
    major: string;
    section: string;
    homeroomTeacherId: string;
  };
  subject: {
    id: string;
    name: string;
  };
}

export interface DeleteModalData {
  title: string;
  type: string;
  assessmentId: string;
  teachingAssignmentId: string;
  assessmentSequence: number;
}

export interface NewColumnData {
  type: AssessmentType;
  givenAt: string;
  dueAt: string;
  detail: string;
}
