import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      userType: string;
      status: string;

      // Student fields
      year?: string | null;
      course?: string | null;
      section?: string | null;

      // Faculty fields
      institute?: string | null;
      department?: string | null;
      position?: string | null;

      // Non-teaching fields
      unit?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: UserRole;
    userType?: string;
    year?: string | null;
    course?: string | null;
    section?: string | null;
    institute?: string | null;
    department?: string | null;
    position?: string | null;
    unit?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: UserRole;
    userType?: string;
    status?: string;

    year?: string | null;
    course?: string | null;
    section?: string | null;
    institute?: string | null;
    department?: string | null;
    position?: string | null;
    unit?: string | null;
  }
}
