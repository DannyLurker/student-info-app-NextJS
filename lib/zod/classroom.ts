import { z } from "zod";
import { classSchema } from "./general";

export const createClassSchema = z.array(classSchema);

export type CreateClassSchema = z.infer<typeof createClassSchema>;

export const updateClassSchema = z.object({
  id: z.number(),
  classSchema: classSchema,
  homeroomTeacherId: z.string().optional(),
});

export type UpdateClassSchema = z.infer<typeof updateClassSchema>;
