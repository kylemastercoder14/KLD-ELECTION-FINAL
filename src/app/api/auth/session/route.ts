import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const sessionCookie = (await cookies()).get("kld-election-auth-session");
  if (!sessionCookie?.value) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    // ✅ Decode JWT to get user ID (instead of using the raw cookie value)
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
    const userId = payload.id as string;

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
