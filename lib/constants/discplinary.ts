export const VALID_INFRACTION_TYPE = [
  "LATE",
  "UNIFORM",
  "DISCIPLINE",
  "ACADEMIC",
  "SOCIAL",
  "OTHER",
] as const;
export type ValidInfractionType = (typeof VALID_INFRACTION_TYPE)[number];

export const SINGLE_PER_DAY_CATEGORIES = ["LATE", "UNIFORM"] as const;
export type SinglePerDayCategories = (typeof SINGLE_PER_DAY_CATEGORIES)[number];

export const categoryLabelMap: Record<string, string> = {
  LATE: "Late",
  UNIFORM: "Uniform",
};
