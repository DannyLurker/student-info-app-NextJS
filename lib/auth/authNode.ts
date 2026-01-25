import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { isStudentRole, isTeacherRole, Role } from "@/lib/constants/roles";
import { prisma } from "@/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  debug: false,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        let user;
        let isHomeroomClassTeacher;

        user = await prisma.student.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            password: true,
          },
        });

        if (!user) {
          user = await prisma.teacher.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              password: true,
            },
          });
        }

        if (!user) {
          user = await prisma.parent.findUnique({
            where: { email },
          });
        }

        if (!user) {
          throw new Error("User not found");
        }

        if (user.role === "TEACHER") {
          isHomeroomClassTeacher = await prisma.homeroomClass.findUnique({
            where: {
              teacherId: user.id,
            },
            select: {
              teacherId: true,
            },
          });
        }

        // cek password
        const isValid = await bcrypt.compare(password, user.password as string);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isHomeroomClassTeacher: isHomeroomClassTeacher ? true : false,
        };
      },
    }),
  ],
  callbacks: {
    // Callback JWT - menambahkan role ke token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        if (isTeacherRole(user.role)) {
          token.isHomeroomClassTeacher = user.isHomeroomClassTeacher;
        }
      }

      return token;
    },
    // Callback Session - menambahkan property ke session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }

      if (isTeacherRole(session.user.role)) {
        session.user.isHomeroomClassTeacher =
          token.isHomeroomClassTeacher as boolean;
      }
      return session;
    },
  },
});
