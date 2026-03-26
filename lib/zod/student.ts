import { z } from "zod";
import {
  classSchema,
  ClassSectionEnum,
  GradeEnum,
  MajorEnum,
  page,
  passwordSchema,
  StudentRoleEnum,
} from "./general";

export const studentQuerySchema = z.object({
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

export type StudentQuerySchema = z.infer<typeof studentQuerySchema>;

export const studentSignUpSchema = z.object({
  username: z.string().min(3, { message: "Must be 3 characters at minimum" }),
  email: z.string().email({ message: "Please input a correct format" }),
  passwordSchema,
  classSchema,
  studentRole: StudentRoleEnum,
});

export type StudentSignUpSchema = z.infer<typeof studentSignUpSchema>;

export const getStudentExportSchema = z.object({
  grade: GradeEnum,
  major: MajorEnum,
  section: ClassSectionEnum,
});

export type GetStudentExportSchema = z.infer<typeof getStudentExportSchema>;
