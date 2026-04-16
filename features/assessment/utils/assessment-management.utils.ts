import { getFullClassLabel } from "@/lib/utils/labels";
import {
  Assessment,
  StudentRow,
  TeachingAssignment,
} from "../types/assessment-management.types";
import { ClassSection, Grade, Major } from "@/lib/constants/class";

/**
 * Transforms the API response (assessment-centric) into a student-centric
 * flat array that the grading table can render.
 */
export function buildStudentRows(assessments: Assessment[]): StudentRow[] {
  const studentMap = new Map<string, StudentRow>();

  assessments.forEach((assessment) => {
    for (const score of assessment.scores) {
      const studentId = score.student.user.id;
      const studentName = score.student.user.name;

      let row = studentMap.get(studentId);
      if (!row) {
        row = {
          studentId,
          studentName,
          marks: [],
        };
        studentMap.set(studentId, row);
      }

      row.marks.push({
        assessmentId: assessment.id,
        assessmentScoreId: score.id ?? "",
        createdAt: assessment.createdAt,
        score: score.score,
        type: assessment.type,
        title: assessment.title,
        givenAt: assessment.givenAt,
        dueAt: assessment.dueAt,
        teachingAssignmentId: assessment.teachingAssignmentId,
      });
    }
  });

  // Sort marks within each student by assessmentNumber
  for (const row of studentMap.values()) {
    row.marks.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  const result = Array.from(studentMap.values());

  result.sort((a, b) => a.studentName.localeCompare(b.studentName));

  return result;
}

/** Build a human-readable label for a teaching assignment */
export function getAssignmentLabel(assignment: TeachingAssignment): string {
  const classLabel = getFullClassLabel(
    assignment.class.grade as Grade,
    assignment.class.major as Major,
    assignment.class.section as ClassSection,
  );
  return `${classLabel} — ${assignment.subject.name}`;
}
