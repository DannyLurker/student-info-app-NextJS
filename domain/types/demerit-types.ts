import { Prisma } from "@prisma/client";

export const demeritCheckSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  studentProfile: {
    select: {
      demerits: {
        select: {
          category: true,
        },
      },
    },
  },
});

export type StudentWithDemerits = Prisma.UserGetPayload<{
  select: typeof demeritCheckSelect;
}>;
