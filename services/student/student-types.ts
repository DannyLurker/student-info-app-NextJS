import { Student } from "./student-service";

export type StudentReponse = {
  students: Student[];
  totalStudents: number;
};
