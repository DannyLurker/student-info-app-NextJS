import { ClassNumber, Grade, Major } from "../constants/class";

export function majorLabel(major: Major) {
  return major === "ACCOUNTING" ? "Accounting" : "Software Engineering";
}

export function gradeLabel(grade: Grade) {
  return grade === "TENTH" ? "10" : grade === "ELEVENTH" ? "11" : 12;
}

export function classNumberLabel(classNumber: ClassNumber) {
  return classNumber === "none" ? "" : classNumber;
}
