import { allCombinedPosition } from "../constants/roles";

export type Session = {
  id: string;
  email: string;
  name: string;
  role: allCombinedPosition;
  homeroomTeacherId?: string | null;
  isHomeroomClassTeacher?: boolean;
};
