import { z } from "zod";
import {
  AssessmentType,
  classSchema,
  ClassSectionEnum,
  zodCustomErrorMsg,
  GradeEnum,
  MajorEnum,
  page,
} from "./general";

// SCORING SYSTEM (TEACHER)
export const queryStudentMarks = z.object({
  studentId: z.string().min(1),
  subjectName: z.string().min(1).optional(),
  isMarkPage: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  page,
});

export type QueryStudentMarksSchema = z.infer<typeof queryStudentMarks>;

const descriptionSchema = z.object({
  givenAt: z.string({ message: "Given at Must be filled" }),
  dueAt: z.string({ message: "Due at Must be filled" }),
  title: z
    .string({ message: "Title must be filled" })
    .max(20, { message: "Title must not exceed 20 characters" }),
});

// CRUD Assessment Schema
export const createStudentAssessmentSchema = z.object({
  class: classSchema,
  subjectId: z.string(zodCustomErrorMsg("Subject id", "string")),
  subjectName: z.string({ message: "Must be filled" }),
  assessmentType: AssessmentType,
  description: descriptionSchema,
});

export type CreateStudentAssessmentSchema = z.infer<
  typeof createStudentAssessmentSchema
>;

export const getStudentAssessmentSchema = z.object({
  grade: GradeEnum,
  major: MajorEnum,
  section: ClassSectionEnum,
  subjectId: z.string(zodCustomErrorMsg("Subject id", "string")),
  page,
});

export type GetStudentAssessmentSchema = z.infer<
  typeof getStudentAssessmentSchema
>;

export const updateStudentAssessmentSchema = z.object({
  assessmentId: z.string(zodCustomErrorMsg("Assessment id", "string")),
  teachingAssignmentId: z.string(
    zodCustomErrorMsg("Teaching assignment id", "string"),
  ),
  assessmentType: AssessmentType,
  descriptionSchema,
});

export type UpdateStudentAssessmentSchema = z.infer<
  typeof updateStudentAssessmentSchema
>;

// Assessment score
const studentAssessmentScore = z.object({
  assessmentScoreId: z.string(
    zodCustomErrorMsg("Assessment score id", "string"),
  ),
  score: z.number({ message: "Must be number and filled" }),
});

const studentMarkData = z.object({
  studentId: z.string({ message: "Studet id field must be filled" }),
  studentAssessments: z
    .array(studentAssessmentScore)
    .nonempty({ message: "Student assessments can't be empty" }),
});

export const updateAssessmentScoresSchema = z.object({
  subjectId: z.string(zodCustomErrorMsg("Subject id", "string")),
  classId: z.string(zodCustomErrorMsg("Class id", "string")),
  students: z
    .array(studentMarkData)
    .nonempty({ message: "student data can't be empty" }),
});

export type UpdateAssessmentScoresSchema = z.infer<
  typeof updateAssessmentScoresSchema
>;

// getStudnetAssessmentScore based on the subject
export const getStudentAssessmentScoreSchema = z.object({
  subjectId: z.string().min(1),
  page,
});

export type GetStudentAssessmentScoreSchema = z.infer<
  typeof getStudentAssessmentScoreSchema
>;
