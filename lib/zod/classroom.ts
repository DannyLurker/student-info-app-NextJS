import { z } from "zod";
import { classSchema, customErrorMsg } from "./general";

export const createClassSchema = z.array(classSchema);

export type CreateClassSchema = z.infer<typeof createClassSchema>;

export const updateClassSchema = z.object({
  id: z.string(customErrorMsg("Id", "string")),
  classSchema: classSchema,
  homeroomTeacherId: z.string().optional(),
});

export type UpdateClassSchema = z.infer<typeof updateClassSchema>;
