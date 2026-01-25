import path from "path";

export const STAFF_STATE = path.join(
  process.cwd(),
  "playwright/.auth/staff.json",
);
export const STUDENT_STATE = path.join(
  process.cwd(),
  "playwright/.auth/student.json",
);
