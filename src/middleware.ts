/* eslint-disable @typescript-eslint/no-explicit-any */
// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";

// Get the NextAuth.js secret directly from environment variables
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

// Define paths that are always public or NextAuth.js internal
const PUBLIC_OR_AUTH_PATHS = [
  "/auth",
  "/api/auth/callback",
  "/api/auth/session",
  "/api/auth/csrf",
  "/api/auth/providers",
  "/",
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Log for debugging
  console.log("Middleware - Path:", pathname);
  console.log(
    "Middleware - Is public/auth path:",
    PUBLIC_OR_AUTH_PATHS.some((path) => pathname.startsWith(path))
  );
  console.log(
    "Middleware - Has NextAuth Session Cookie:",
    !!req.cookies.get("next-auth.session-token")
  );

  // Allow all public/auth paths without any token check
  if (PUBLIC_OR_AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    // If it's the root path '/' and there's a session token, let withAuth handle redirect to /user
    if (pathname === "/" && req.cookies.has("next-auth.session-token")) {
      console.log(
        "Middleware: Root path with session cookie. Delegating to withAuth to check token and redirect."
      );
      return (withAuth as any)(async (req: NextRequest) => {
        // Cast to 'any' to satisfy type if needed
        // Use withAuth's callback argument to get the token
        return (withAuth as any)(
          async ({ token, req }: { token: any; req: NextRequest }) => {
            console.log(
              "Middleware (internal withAuth for root): Token status:",
              !!token
            );
            if (token) {
              // If token is available here, redirect to /user
              return NextResponse.redirect(new URL("/user", req.url));
            }
            return NextResponse.next();
          }
        )(req);
      })(req);
    }
    console.log("Middleware: Allowing public/auth path.");
    return NextResponse.next();
  }

  // For all other protected paths, apply NextAuth's `withAuth` logic.
  // This is where `req.nextauth.token` gets populated.
  // We explicitly define `authorized` here.
  return (withAuth as any)({
    // Cast to 'any' to satisfy type if needed
    callbacks: {
      authorized: ({ token, req }: { token: any; req: NextRequest }) => {
        const currentPath = req.nextUrl.pathname;
        console.log("Authorized Callback (Core Logic): Path:", currentPath);
        console.log("Authorized Callback (Core Logic): Token status:", !!token);

        // If a token is present, the user is authorized.
        if (token) {
          return true;
        }

        // If no token, and it's not a public/auth path (already handled above),
        // redirect to sign-in.
        console.log(
          "Authorized Callback (Core Logic): No token. Redirecting to sign-in."
        );
        return false; // Will trigger redirect to signIn page
      },
    },
    pages: {
      signIn: "/auth/sign-in",
      error: "/auth/error",
    },
    secret: NEXTAUTH_SECRET, // Ensure secret is passed
  })(req);
}

export const config = {
  // IMPORTANT: The matcher must be broad enough to catch ALL paths that need protection,
  // but also *avoid* catching the internal NextAuth.js API routes that need to run
  // unhindered for authentication to complete.
  // We'll exclude static files and API routes handled by NextAuth itself.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (Next.js API routes, excluding NextAuth internal API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
