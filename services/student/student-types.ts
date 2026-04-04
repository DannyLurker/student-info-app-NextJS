import { getStudentProfile, Student } from "./student-service";

export type StudentReponse = {
  students: Student[];
  totalStudents: number;
};

export type StudentProfileResponse = Awaited<
  ReturnType<typeof getStudentProfile>
>;
