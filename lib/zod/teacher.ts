import { z } from "zod";
import {
  classSchema,
  zodCustomErrorMsg,
  passwordSchema,
  teachingAssignmentInput,
} from "./general";

export const teacherSignUpSchema = z.object({
  username: z.string().min(3, { message: "Must be 3 characters at minimum" }),
  email: z.string().email({ message: "Please input a correct format" }),
  passwordSchema,
  homeroomClass: classSchema.optional(),
  assignments: z.array(teachingAssignmentInput).optional(),
});

const updateTeachingAssignmentInput = teachingAssignmentInput.extend({
  teachingAssignmentId: z.string(
    zodCustomErrorMsg("Teaching assignment id", "string"),
  ),
});

export type UpdateTeachingAssignmentInput = z.infer<
  typeof updateTeachingAssignmentInput
>;

export type TeacherSignUpSchema = z.infer<typeof teacherSignUpSchema>;

export const teacherUpdateSchema = z.object({
  name: z
    .string(zodCustomErrorMsg("Name", "string"))
    .min(3, { message: "Must be 3 characters at minimum" }),
  email: z
    .string(zodCustomErrorMsg("Email", "string"))
    .email({ message: "Please input a correct format" }),
  passwordSchema: passwordSchema.optional(),
  homeroomClass: classSchema.optional(),
  teachingAssignments: z
    .array(updateTeachingAssignmentInput)
    .optional()
    .transform((data) => (data === undefined ? [] : data)),
});

export type TeacherUpdateSchema = z.infer<typeof teacherUpdateSchema>;
