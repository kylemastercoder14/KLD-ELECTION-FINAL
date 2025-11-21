import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { studentNumber, password } = await req.json();

    if (!studentNumber || !password) {
      return NextResponse.json(
        { error: "Student number and password are required." },
        { status: 400 }
      );
    }

    // Find user by userId (student number)
    const user = await db.user.findUnique({
      where: { userId: studentNumber },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid student/employee number or password." },
        { status: 401 }
      );
    }

    // Verify password
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid student/employee number or password." },
        { status: 401 }
      );
    }

    // Create Better Auth session manually
    // We need to use the correct cookie name that Better Auth expects
    const { randomUUID } = await import("crypto");
    const sessionToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Get IP address and user agent from request
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create session in database (Better Auth format)
    await db.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt: expiresAt,
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userId: user.userId,
      },
    });

    // Set Better Auth session cookie
    // Better Auth uses "better-auth.session_token" as the cookie name
    // Make sure it matches what getSession expects
    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      domain: undefined, // Let browser set the domain
    });

    return response;
  } catch (error) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { error: "An error occurred during authentication." },
      { status: 500 }
    );
  }
}
