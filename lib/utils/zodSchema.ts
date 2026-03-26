import { z } from "zod";

const GradeEnum = z.enum(["TENTH", "ELEVENTH", "TWELFTH"]);
const MajorEnum = z.enum(["ACCOUNTING", "SOFTWARE_ENGINEERING"]);
const StudentRoleEnum = z.enum(["STUDENT", "CLASS_SECRETARY"]);
const ClassSectionEnum = z.enum(["none", "1", "2"]);

const classSchema = z.object({
  grade: GradeEnum,
  major: MajorEnum,
  section: ClassSectionEnum,
});

type ClassSchema = z.infer<typeof classSchema>;

// HOMEROOM CLASS STUDENT
const homeroomClassStudent = z.object({
  teacherId: z.string({ message: "Must be filled" }),
  date: z.date({ message: "Must be filled" }),
});

type HomeroomClassStudentSchema = z.infer<typeof homeroomClassStudent>;

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
  homeroomClassStudent,
  classSchema,
  updateStudentProfileSchema,
  type ClassSchema,
  type HomeroomClassStudentSchema,
  type UpdateStudentProfileSchema,
};
