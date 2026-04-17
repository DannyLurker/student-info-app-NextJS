import NextAuth from "next-auth";

export const { auth: authEdge } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      const isLoggedIn = !!auth?.user;

      return isLoggedIn;
    },
  },
});
