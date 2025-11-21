import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { ROLE_HOME_ROUTES, ROUTE_ROLE_GUARDS } from "@/constants/auth-routes";

const AUTH_PUBLIC_PATHS = ["/auth/sign-in", "/auth/error", "/auth/signin-redirect", "/waiting-approval"];
const PUBLIC_PREFIX_PATHS = ["/election"];

const isAuthPublicPath = (pathname: string) =>
  AUTH_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

const isPublicPath = (pathname: string) => {
  if (pathname === "/" || pathname === "") {
    return true;
  }

  return PUBLIC_PREFIX_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
};

const isStaticAsset = (pathname: string) =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/static") ||
  pathname === "/favicon.ico";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticAsset(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for Better Auth session cookie (works in Edge Runtime)
  // Better Auth stores session in cookies - check for any auth-related cookie
  const hasAuthCookie = req.cookies.get("better-auth.session_token")?.value ||
                        req.cookies.get("better-auth.session")?.value ||
                        req.cookies.get("session")?.value;
  const hasSession = !!hasAuthCookie;

  if (!hasSession) {
    if (isAuthPublicPath(pathname) || isPublicPath(pathname)) {
      return NextResponse.next();
    }

    const signInUrl = new URL("/auth/sign-in", req.url);
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
    if (callbackUrl && callbackUrl !== "/") {
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
    }
    return NextResponse.redirect(signInUrl);
  }

  // For authenticated users, redirect from auth pages and root
  // Role-based routing will happen in signin-redirect page (Node.js runtime)
  // Don't redirect if already on signin-redirect or waiting-approval
  if (isAuthPublicPath(pathname) && pathname !== "/auth/signin-redirect" && pathname !== "/waiting-approval") {
    return NextResponse.redirect(new URL("/auth/signin-redirect", req.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/auth/signin-redirect", req.url));
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // For protected paths, let them through
  // Role-based access control happens in route handlers/layouts (Node.js runtime)
  return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|assets).*)"],
};
