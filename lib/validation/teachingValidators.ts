import { badRequest } from "../errors";
import { getFullClassLabel } from "../utils/labels";
import { TeachingAssignmentInput } from "../utils/zodSchema";

export function validateTeachingStructure(
  teachingAssignment: TeachingAssignmentInput[],
) {
  isTeachingAssignmentsValid(teachingAssignment);
}

export function isTeachingAssignmentsValid(
  teachingAssignment: TeachingAssignmentInput[],
) {
  const assignmentKeys = new Set<string>();
  // Check for duplicate assignments (same subject in same class)
  for (const ta of teachingAssignment) {
    const key = `${ta.grade}-${ta.major}-${ta.section}-${ta.subjectName}`;
    if (assignmentKeys.has(key)) {
      const classLabel = getFullClassLabel(ta.grade, ta.major, ta.section);

      throw badRequest(
        `Duplicate assignment detected! You cannot teach "${ta.subjectName}" more than once in ${classLabel}.`,
      );
    }
    assignmentKeys.add(key);
  }
}
