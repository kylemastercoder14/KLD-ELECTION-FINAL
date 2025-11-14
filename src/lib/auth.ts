/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";

// ✅ Track newly created users
const newlyCreatedUsers = new Set<string>();

// ✅ Custom adapter that transforms `name` → `firstName`/`lastName`
function CustomPrismaAdapter(prisma: typeof db): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,
    async createUser(data: any) {
      const { name, ...rest } = data as any;

      console.log("CustomAdapter: Creating new user with transformed data");

      const user = (await prisma.user.create({
        data: {
          ...rest,
          name,
        },
      })) as any;

      // ✅ Mark this user as newly created
      newlyCreatedUsers.add(user.email);
      console.log("CustomAdapter: Marked user as new:", user.email);

      // ✅ Auto-remove after 30 seconds (cleanup)
      setTimeout(() => {
        newlyCreatedUsers.delete(user.email);
      }, 30000);

      return user;
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: "kld.edu.ph",
        },
      },
    }),
    CredentialsProvider({
      id: "student-number",
      name: "Student Number",
      credentials: {
        studentNumber: {
          label: "Student Number",
          type: "text",
          placeholder: "Enter your student number",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        console.log("Credentials Provider: authorize function called.");
        if (!credentials?.studentNumber || !credentials?.password) {
          console.log(
            "Credentials Provider: Missing student number or password."
          );
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { userId: credentials.studentNumber },
            include: {
              candidate: true,
            },
          });

          if (!user) {
            console.log(
              `Credentials Provider: User with ${credentials.studentNumber} not found.`
            );
            return null;
          }

          if (credentials.password !== user.password) {
            console.log(
              `Credentials Provider: Invalid password for user ${credentials.studentNumber}.`
            );
            return null;
          }

          console.log(
            `Credentials Provider: Successfully authorized user ${user.id} (${user.email}).`
          );
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isCandidate: !!user.candidate,
            image: user.image,
            role: user.role,
            studentNumber: user.userId,
            status: user.status,
          };
        } catch (error) {
          console.error(
            "Credentials Provider: Error during authorization:",
            error
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        try {
          let dbUser;

          if (account?.provider === "google") {
            dbUser = await db.user.findUnique({
              where: { email: user.email! },
            });
          } else if (account?.provider === "student-number") {
            dbUser = await db.user.findUnique({
              where: { id: user.id },
            });
          }

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.userType = dbUser.userType;
            token.status = dbUser.status;
            token.year = dbUser.year;
            token.course = dbUser.course;
            token.section = dbUser.section;
            token.institute = dbUser.institute;
            token.department = dbUser.department;
            token.unit = dbUser.unit;
          }
        } catch (error) {
          console.error("JWT Callback Error:", error);
        }
      }

      return token;
    },

    async session({ session }) {
      if (!session.user?.email) return session;

      // ✅ Refetch latest user data from the database
      const dbUser = await db.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          role: true,
          userType: true,
          status: true,
          year: true,
          course: true,
          section: true,
          institute: true,
          department: true,
          position: true,
          unit: true,
        },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.userType = dbUser.userType;
        session.user.status = dbUser.status;

        // student fields
        session.user.year = dbUser.year;
        session.user.course = dbUser.course;
        session.user.section = dbUser.section;

        // faculty fields
        session.user.institute = dbUser.institute;
        session.user.department = dbUser.department;
        session.user.position = dbUser.position;

        // non-teaching fields
        session.user.unit = dbUser.unit;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      console.log("SignIn Callback: Called.", { user, account, profile });

      if (
        account?.provider === "google" &&
        profile?.email?.endsWith("@kld.edu.ph")
      ) {
        console.log("SignIn Callback: Google KLD. Returning true.");
        return true;
      } else if (
        account?.provider === "google" &&
        !profile?.email?.endsWith("@kld.edu.ph")
      ) {
        console.log("SignIn Callback: Unauthorized email. Returning false.");
        return false;
      } else if (account?.provider === "student-number") {
        console.log("SignIn Callback: Student Number. Returning true.");
        return true;
      }

      return false;
    },

    // ✅ Redirect based on isNewUser flag
    async redirect({ url, baseUrl }) {
      console.log("Redirect Callback: Called.", { url, baseUrl });

      // ✅ If redirecting after sign in, check the callback URL
      if (url.includes("/api/auth/callback")) {
        // We'll check session in a moment, but for now return default
        // The actual redirect will be handled by checking session.isNewUser
        return `${baseUrl}/auth/signin-redirect`;
      }

      // If URL already points somewhere specific, use that
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;

      return `${baseUrl}/user`;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  events: {
    async signIn(message) {
      console.log("NextAuth Event: SignIn", message);
    },
    async signOut(message) {
      console.log("NextAuth Event: SignOut", message);
    },
    async createUser(message) {
      console.log("NextAuth Event: CreateUser", message);
    },
    async linkAccount(message) {
      console.log("NextAuth Event: LinkAccount", message);
    },
    async session(message) {
      console.log("NextAuth Event: Session", message);
    },
  },
};
