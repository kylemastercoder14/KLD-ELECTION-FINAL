import { cookies } from "next/headers";
import db from "./db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * ✅ Server-side session (secure, uses JWT + database)
 * Use in: API routes, server actions, server components
 */
export async function getServerSession() {
  const sessionCookie = (await cookies()).get("kld-election-auth-session");
  if (!sessionCookie?.value) return null;

  try {
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
    const userId = payload.id as string;
    if (!userId) return null;

    // Query user directly from database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (err) {
    console.error("Server session error:", err);
    return null;
  }
}

/**
 * 🌐 Client-side session (calls your API to validate)
 * Use in: Client components or useEffect hooks
 */
export async function getClientSession() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`,
      {
        credentials: "include", // send cookies automatically
      }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Client session error:", error);
    return null;
  }
}
