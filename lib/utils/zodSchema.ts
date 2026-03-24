import { z } from "zod";

const GradeEnum = z.enum(["TENTH", "ELEVENTH", "TWELFTH"]);
const MajorEnum = z.enum(["ACCOUNTING", "SOFTWARE_ENGINEERING"]);
const StudentRoleEnum = z.enum(["STUDENT", "CLASS_SECRETARY"]);
const ClassSectionEnum = z.enum(["none", "1", "2"]);
const AssessmentType = z.enum([
  "SCHOOLWORK",
  "HOMEWORK",
  "QUIZ",
  "EXAM",
  "PROJECT",
  "GROUP_WORK",
]);

const page = z
  .string()
  .default("0")
  .transform((val) => Number(val))
  .refine((val) => Number.isInteger(val) && val >= 0, {
    message: "page must be a non-negative integer",
  });

// Schema for frontend data (what we send from CreateTeacherAccount)

const classSchema = z.object({
  grade: GradeEnum,
  major: MajorEnum,
  section: ClassSectionEnum,
});

type ClassSchema = z.infer<typeof classSchema>;

// Main schemas
// Classroom

// Student
const studentQuerySchema = z.object({
  grade: GradeEnum.optional(),
  major: MajorEnum.optional(),
  section: ClassSectionEnum.optional(),
  page,
  search: z.string().optional(),
  isPaginationActive: z
    .string()
    .default("true")
    .transform((v) => Boolean(v)),
});

// HOMEROOM CLASS STUDENT
const homeroomClassStudent = z.object({
  teacherId: z.string({ message: "Must be filled" }),
  date: z.date({ message: "Must be filled" }),
});

type HomeroomClassStudentSchema = z.infer<typeof homeroomClassStudent>;

// SCORING SYSTEM (TEACHER)
const queryStudentMarks = z.object({
  studentId: z.string().min(1),
  subjectName: z.string().min(1).optional(),
  isMarkPage: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  page,
});

type QueryStudentMarksSchema = z.infer<typeof queryStudentMarks>;

const descriptionSchema = z.object({
  givenAt: z.string({ message: "Given at Must be filled" }),
  dueAt: z.string({ message: "Due at Must be filled" }),
  title: z
    .string({ message: "Title must be filled" })
    .max(20, { message: "Title must not exceed 20 characters" }),
});

// CRUD Assessment Schema
const createStudentAssessmentSchema = z.object({
  class: classSchema,
  subjectId: z.number({ message: "Must be filled" }),
  subjectName: z.string({ message: "Must be filled" }),
  assessmentType: AssessmentType,
  description: descriptionSchema,
});

type CreateStudentAssessmentSchema = z.infer<
  typeof createStudentAssessmentSchema
>;

const getStudentAssessmentSchema = z.object({
  grade: GradeEnum,
  major: MajorEnum,
  section: ClassSectionEnum,
  subjectId: z
    .string()
    .min(1, { message: "Must be filled" })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), { message: "Must be a valid number" }),
  page,
});

type GetStudentAssessmentSchema = z.infer<typeof getStudentAssessmentSchema>;

const updateStudentAssessmentSchema = z.object({
  assessmentId: z.number({ message: "Assessment id must be filled" }),
  teachingAssignmentId: z.number({
    message: "Teaching assignment id must be filled",
  }),
  assessmentType: AssessmentType,
  descriptionSchema,
});

type UpdateStudentAssessmentSchema = z.infer<
  typeof updateStudentAssessmentSchema
>;

// Assessment score
const studentAssessmentScore = z.object({
  assessmentScoreId: z.number({
    message: "Assessment score id must be filled",
  }),
  score: z.number({ message: "Must be number and filled" }),
});

const studentMarkData = z.object({
  studentId: z.string({ message: "Studet id field must be filled" }),
  studentAssessments: z
    .array(studentAssessmentScore)
    .nonempty({ message: "Student assessments can't be empty" }),
});

const updateAssessmentScoresSchema = z.object({
  subjectId: z.number({ message: "Subject id field must be filled" }),
  classId: z.number({ message: "Class id field must be filled" }),
  students: z
    .array(studentMarkData)
    .nonempty({ message: "student data can't be empty" }),
});

type UpdateAssessmentScoresSchema = z.infer<
  typeof updateAssessmentScoresSchema
>;

// getStudnetAssessmentScore based on the subject
const getStudnetAssessmentScore = z.object({
  subjectId: z
    .string()
    .min(1)
    .transform((value) => Number(value)),
  page,
});

type GetStudnetAssessmentScore = z.infer<typeof getStudentAssessmentSchema>;

// Edit User (Staff Feature)
// Student
const updateStudentProfileSchema = z.object({
  id: z.string({ message: "Id field must be filled" }),
  name: z.string({ message: "Name field must be filled" }),
  role: StudentRoleEnum,
  classSchema,
});

type UpdateStudentProfileSchema = z.infer<typeof updateStudentProfileSchema>;

export const updateStudentsClassSchema = z.object({
  updatedClassId: z.number({
    required_error: "Class ID is required",
    invalid_type_error: "Class ID must be a number",
  }),

  studentIds: z
    .array(z.string().min(1))
    .min(1, { message: "At least one student must be provided." }),
});

export {
  studentQuerySchema,
  homeroomClassStudent,
  queryStudentMarks,
  createStudentAssessmentSchema,
  getStudentAssessmentSchema,
  updateStudentAssessmentSchema,
  updateAssessmentScoresSchema,
  getStudnetAssessmentScore,
  classSchema,
  updateStudentProfileSchema,
  type ClassSchema,
  type HomeroomClassStudentSchema,
  type QueryStudentMarksSchema,
  type CreateStudentAssessmentSchema,
  type GetStudentAssessmentSchema,
  type UpdateStudentAssessmentSchema,
  type GetStudnetAssessmentScore,
  type UpdateAssessmentScoresSchema,
  type UpdateStudentProfileSchema,
};
