import { Role } from "../constants/roles";

export type Session = {
  id: string;
  email: string;
  name: string;
  role: Role;
  homeroomTeacherId?: string | null;
  isHomeroomClassTeacher?: boolean;
};
