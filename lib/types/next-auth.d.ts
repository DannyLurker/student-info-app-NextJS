import { DefaultSession } from "next-auth";
import { Role } from "../constants/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      isHomeroomClassTeacher: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role: Role;
    isHomeroomClassTeacher: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: Role;
    isHomeroomClassTeacher: boolean;
  }
}
