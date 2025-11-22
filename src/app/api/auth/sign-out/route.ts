import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const cookies = headersList.get("cookie") || "";

    // Get session token from cookie
    // Better Auth uses "better-auth.session" as the cookie name (per auth.ts config)
    const sessionTokenMatch =
      cookies.match(/better-auth\.session=([^;]+)/) ||
      cookies.match(/better-auth\.session_token=([^;]+)/) ||
      cookies.match(/session=([^;]+)/);

    if (sessionTokenMatch) {
      const sessionToken = sessionTokenMatch[1];

      // Delete session from database
      try {
        await db.session.deleteMany({
          where: {
            OR: [
              { token: sessionToken },
              { sessionToken: sessionToken },
            ],
          },
        });
      } catch (dbError) {
        console.error("Error deleting session from database:", dbError);
        // Continue anyway to clear cookies
      }
    }

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Signed out successfully" },
      { status: 200 }
    );

    // Clear all possible session cookies
    const cookieNames = [
      "better-auth.session",
      "better-auth.session_token",
      "session",
    ];

    cookieNames.forEach((cookieName) => {
      // Clear cookie by setting it to expire in the past
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        domain:
          process.env.NODE_ENV === "production" ? ".votenyo.com" : undefined,
      });
    });

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    // Even if there's an error, clear cookies and return success
    const response = NextResponse.json(
      { success: true, message: "Signed out successfully" },
      { status: 200 }
    );

    // Clear all possible session cookies
    const cookieNames = [
      "better-auth.session",
      "better-auth.session_token",
      "session",
    ];

    cookieNames.forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        domain:
          process.env.NODE_ENV === "production" ? ".votenyo.com" : undefined,
      });
    });

    return response;
  }
}

