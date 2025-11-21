import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
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
            select: { role: true },
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
      const sessionTokenMatch = cookies.match(/better-auth\.session_token=([^;]+)/);

      if (sessionTokenMatch) {
        const sessionToken = sessionTokenMatch[1];
        const dbSession = await db.session.findUnique({
          where: { token: sessionToken },
          include: { user: true },
        });

        if (dbSession && dbSession.expiresAt > new Date()) {
          // Fetch full user data
          const dbUser = await db.user.findUnique({
            where: { id: dbSession.user.id },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
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
              userId: true,
            },
          });

          if (dbUser) {
            session = {
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
            userId = dbUser.id;
          }
        }
      }
    }

    if (!session?.user) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error("Error in get-session API:", error);
    return NextResponse.json({ session: null }, { status: 200 });
  }
}

