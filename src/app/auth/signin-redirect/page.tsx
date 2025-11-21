import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROLE_HOME_ROUTES, ROUTE_ROLE_GUARDS } from "@/constants/auth-routes";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sanitizeCallbackPath = (path?: string | null) => {
  if (!path) return undefined;

  let decoded = path;

  try {
    decoded = decodeURIComponent(path);
  } catch {
    return undefined;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.startsWith("/auth")
  ) {
    return undefined;
  }

  return decoded;
};

const canRoleAccessPath = (role: string, pathname: string) => {
  const guard = ROUTE_ROLE_GUARDS.find(
    ({ prefix }) =>
      pathname === prefix ||
      (prefix !== "/" && pathname.startsWith(`${prefix}/`))
  );

  if (!guard) {
    return true;
  }

  return guard.roles.includes(role);
};

export default async function SignInRedirect({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  const headersList = await import("next/headers").then((h) => h.headers());

  // Try to get session from Better Auth or database
  let session;
  let userId: string | null = null;

  try {
    session = await auth.api.getSession({
      headers: headersList,
    });
    if (session?.user) {
      userId = session.user.id;
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
      const db = (await import("@/lib/db")).default;
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
    // Clear the invalid cookie and redirect to sign-in
    redirect("/auth/sign-in");
  }

  // Fetch full user data from database to get status and role
  const db = (await import("@/lib/db")).default;
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (!dbUser) {
    redirect("/auth/sign-in");
  }

  const normalizedStatus = dbUser.status?.toUpperCase();
  if (normalizedStatus === "PENDING") {
    redirect("/waiting-approval");
  }

  const callbackPath = sanitizeCallbackPath(
    typeof params?.callbackUrl === "string"
      ? params?.callbackUrl
      : undefined
  );

  if (callbackPath && canRoleAccessPath(dbUser.role, callbackPath)) {
    redirect(callbackPath);
  }

  const destination = ROLE_HOME_ROUTES[dbUser.role] ?? ROLE_HOME_ROUTES.USER;

  redirect(destination);
}
