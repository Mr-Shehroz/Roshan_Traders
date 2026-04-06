import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validUser = process.env.ADMIN_USERNAME;
        const validPass = process.env.ADMIN_PASSWORD;

        if (
          credentials?.username === validUser &&
          credentials?.password === validPass
        ) {
          return { id: "1", name: "Admin", email: "admin@store.local" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) session.user = { name: token.name, email: token.email };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};