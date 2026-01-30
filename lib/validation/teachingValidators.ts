import { badRequest } from "../errors";
import { getFullClassLabel } from "../utils/labels";
import { subjects } from "../utils/subjects";
import { ClassSchema, TeachingAssignmentInput } from "../utils/zodSchema";

export function validateTeachingStructure(
  teachingClasses: ClassSchema[],
  teachingAssignment: TeachingAssignmentInput[],
) {
  isTeachingClassesValid(teachingClasses, teachingAssignment);
  isTeachingAssignmentsValid(teachingClasses, teachingAssignment);
}

export function isTeachingClassesValid(
  teachingClasses: ClassSchema[],
  teachingAssignment: TeachingAssignmentInput[],
) {
  const assignmentKeys = new Set(
    teachingAssignment.map((ta) => `${ta.grade}-${ta.major}-${ta.classNumber}`),
  );

  for (const tc of teachingClasses) {
    const matchingAssignment = assignmentKeys.has(
      `${tc.grade}-${tc.major}-${tc.classNumber}`,
    );

    if (!matchingAssignment) {
      const classLabel = getFullClassLabel(tc.grade, tc.major, tc.classNumber);

      throw badRequest(
        `Teaching Classes mismatch! You have a teaching class for ${classLabel}, but this class is not in your Teaching Assignments list. Please add it to Teaching Assignments also.`,
      );
    }
  }
}

export function isTeachingAssignmentsValid(
  teachingClasses: ClassSchema[],
  teachingAssignment: TeachingAssignmentInput[],
) {
  const classesKeys = new Set(
    teachingClasses.map((tc) => `${tc.grade}-${tc.major}-${tc.classNumber}`),
  );
  const assignmentKeys = new Set<string>();

  // Check if every teaching assignment matches one of the teaching classes
  for (const ta of teachingAssignment) {
    const matchingClass = classesKeys.has(
      `${ta.grade}-${ta.major}-${ta.classNumber}`,
    );

    if (!matchingClass) {
      const classLabel = getFullClassLabel(ta.grade, ta.major, ta.classNumber);

      throw badRequest(
        `Teaching Assignment mismatch! You have an assignment for ${classLabel}, but this class is not in your Teaching Classes list. Please add it to Teaching Classes first.`,
      );
    }
  }

  // Check if the subject is valid for that specific class
  for (const ta of teachingAssignment) {
    const allowedSubjects = subjects[ta.grade].major[ta.major];

    if (!allowedSubjects.includes(ta.subjectName)) {
      const classLabel = getFullClassLabel(ta.grade, ta.major, ta.classNumber);

      throw badRequest(
        `Subject mismatch! The subject "${ta.subjectName}" is not available for ${classLabel}. Please check the curriculum.`,
      );
    }
  }

  // Check for duplicate assignments (same subject in same class)
  for (const ta of teachingAssignment) {
    const key = `${ta.grade}-${ta.major}-${ta.classNumber}-${ta.subjectName}`;
    if (assignmentKeys.has(key)) {
      const classLabel = getFullClassLabel(ta.grade, ta.major, ta.classNumber);

      throw badRequest(
        `Duplicate assignment detected! You cannot teach "${ta.subjectName}" more than once in ${classLabel}.`,
      );
    }
    assignmentKeys.add(key);
  }
}
