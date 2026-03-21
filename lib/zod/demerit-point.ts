import { z } from "zod";
import {
  ClassSectionEnum,
  DemeritCategoryEnum,
  GradeEnum,
  MajorEnum,
} from "./general";

// DEMERIT POINT
export const demeritPointQuerySchema = z.object({
  grade: GradeEnum,
  major: MajorEnum,
  section: ClassSectionEnum,
});

export const createDemeritPointSchema = z.object({
  studentsId: z.array(z.string()).min(1),
  demeritCategory: DemeritCategoryEnum,
  points: z
    .number({ message: "Point field must be filled" })
    .min(5, { message: "Point field must be filled. The minimum points is 5" }),
  description: z.string().max(300),
  date: z.string(),
});

export type CreateDemeritPointSchema = z.infer<typeof createDemeritPointSchema>;

export const updateDemeritPointSchema = z.object({
  demeritRecordId: z.number(),
  demeritCategory: DemeritCategoryEnum,
  points: z
    .number({ message: "Point field must be filled" })
    .min(5, { message: "Point field must be filled. The minimum points is 5" }),
  description: z.string().max(300),
  date: z.string(),
});

export type UpdateDemeritPointSchema = z.infer<typeof updateDemeritPointSchema>;
