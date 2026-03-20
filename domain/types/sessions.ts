import { StaffPosition, StudentPosition } from "@/lib/constants/roles";

export type SecretarySession = {
  userId: string;
  studentRole: StudentPosition;
  classId: number | null;
  user: {
    name: string;
  };
};

export type HomeroomTeacherSession = {
  userId: string;
  staffRole: StaffPosition;
  homeroom: any;
  user: {
    name: string;
  };
};
