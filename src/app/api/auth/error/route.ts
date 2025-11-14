import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");

  console.log("Auth error occurred:", error);

  // Log the error for debugging
  if (error) {
    console.error(`Authentication error: ${error}`);
  }

  // Redirect to our custom error page
  return NextResponse.redirect(
    new URL(`/auth/error?error=${error}`, request.url)
  );
}
