import {
  categoryLabelMap,
  SINGLE_PER_DAY_CATEGORIES,
  SinglePerDayCategories,
  ValidInfractionType,
} from "@/lib/constants/discplinary";
import { StudentWithDemerits } from "../types/demerit-types";
import { badRequest } from "@/lib/errors";

// The funcionality of "category is SinglePerDayCategories" is if the function return true, the category must be "LATE" or "INCOMPLETE_ATTRIBUTES"
export function isSinglePerDayCategory(
  category: ValidInfractionType,
): category is SinglePerDayCategories {
  return SINGLE_PER_DAY_CATEGORIES.includes(category as SinglePerDayCategories);
}

// The limit is once / day
export function validateDailyDemeritLimit(student: StudentWithDemerits) {
  const lateDemeritRecord = student.studentProfile!.demerits.find(
    (d: { category: ValidInfractionType }) => d.category == "LATE",
  );

  if (lateDemeritRecord?.category) {
    throw badRequest(
      `This ${student.name} already has "${categoryLabelMap[lateDemeritRecord.category]}" problem. Only one per day`,
    );
  }

  const attributesDemeritRecord = student.studentProfile!.demerits.find(
    (d: { category: ValidInfractionType }) => d.category == "UNIFORM",
  );

  if (attributesDemeritRecord?.category) {
    throw badRequest(
      `This ${student.name} already has "${categoryLabelMap[attributesDemeritRecord.category]}" problem. Only one per day`,
    );
  }
}
