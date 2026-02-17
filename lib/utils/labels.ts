import { CLASS_SECTION, ClassSection, Grade, Major } from "../constants/class";

export const GRADE_DISPLAY_MAP: Record<string, string> = {
  TENTH: "Grade 10",
  ELEVENTH: "Grade 11",
  TWELFTH: "Grade 12",
};

export const MAJOR_DISPLAY_MAP: Record<string, string> = {
  SOFTWARE_ENGINEERING: "Software Engineering",
  ACCOUNTING: "Accounting",
};

export const SECTION_DISPLAY_MAP: Record<string, string> = {
  none: "",
  1: "1",
  2: "2",
};

export const STUDENT_ROLES_MAP: Record<string, string> = {
  STUDENT: "Student",
  CLASS_SECRETARY: "Class Secretary",
};

export function getMajorDisplayName(major: Major): string {
  return MAJOR_DISPLAY_MAP[major];
}

export function getGradeNumber(grade: Grade): string {
  switch (grade) {
    case "TENTH":
      return "10";
    case "ELEVENTH":
      return "11";
    case "TWELFTH":
      return "12";
  }
}

export function formatClassSection(classSection: ClassSection): string {
  if (!CLASS_SECTION.includes(classSection)) {
    return `${classSection} (Class section format is wrong. Please use: none, 1, or 2)`;
  }

  return classSection === "none" ? "" : classSection;
}

export function getFullClassLabel(
  grade: Grade,
  major: Major,
  classSection: ClassSection,
) {
  return `${getGradeNumber(grade)}-${getMajorDisplayName(major)} ${formatClassSection(classSection)}`;
}
