import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Tetap gunakan JWT agar kompatibel dengan Credentials
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [student, teacher, parent] = await Promise.all([
          prisma.student.findUnique({ where: { email } }),
          prisma.teacher.findUnique({ where: { email } }),
          prisma.parent.findUnique({ where: { email } }),
        ]);

        const dbUser = student || teacher || parent;
        if (!dbUser || !dbUser.password) return null;

        const isValid = await bcrypt.compare(password, dbUser.password);
        if (!isValid) return null;

        let isHomeroom = false;
        if (teacher) {
          const homeroom = await prisma.homeroomClass.findUnique({
            where: { teacherId: teacher.id },
          });
          isHomeroom = !!homeroom;
        }

        await prisma.user.upsert({
          where: { email: dbUser.email },
          update: {
            name: dbUser.name,
            role: dbUser.role,
            isHomeroomClassTeacher: isHomeroom,
          },
          create: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            isHomeroomClassTeacher: isHomeroom,
          },
        });

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          isHomeroomClassTeacher: isHomeroom,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isHomeroomClassTeacher = (user as any).isHomeroomClassTeacher;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role as any;
        session.user.isHomeroomClassTeacher =
          token.isHomeroomClassTeacher as boolean;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
