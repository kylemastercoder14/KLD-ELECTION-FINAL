/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "./auth";
import db from "./db";
import { headers } from "next/headers";

export async function getServerSession() {
  try {
    const headersList = await headers();
    let session;
    let userId: string | null = null;

    // Try to get session from Better Auth
    try {
      session = await auth.api.getSession({
        headers: headersList,
      });
      if (session?.user) {
        userId = session.user.id;
        // If Better Auth session doesn't include role, fetch it from database
        if (!(session.user as any).role) {
          const dbUser = await db.user.findUnique({
            where: { id: userId },
          });
          if (dbUser) {
            (session.user as any).role = dbUser.role;
          }
        }
      }
    } catch (error) {
      console.error("Error getting session from Better Auth:", error);
    }

    // If getSession fails, try to get session directly from database using cookie
    if (!session?.user || !userId) {
      const cookies = headersList.get("cookie") || "";
      const sessionTokenMatch = cookies.match(
        /better-auth\.session_token=([^;]+)/
      );

      if (sessionTokenMatch) {
        const sessionToken = sessionTokenMatch[1];
        const dbSession = await db.session.findUnique({
          where: { token: sessionToken },
          include: { user: true },
        });

        if (dbSession && dbSession.expiresAt > new Date()) {
          session = {
            user: {
              id: dbSession.user.id,
              email: dbSession.user.email || "",
              name: dbSession.user.name || "",
            },
          };
          userId = dbSession.user.id;
        }
      }
    }

    if (!session?.user || !userId) {
      return null;
    }

    // Fetch full user data from database
    const dbUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      return null;
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        role: dbUser.role,
        userType: dbUser.userType,
        status: dbUser.status,
        year: dbUser.year,
        course: dbUser.course,
        section: dbUser.section,
        institute: dbUser.institute,
        department: dbUser.department,
        position: dbUser.position,
        unit: dbUser.unit,
        userId: dbUser.userId,
      },
    };
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}
