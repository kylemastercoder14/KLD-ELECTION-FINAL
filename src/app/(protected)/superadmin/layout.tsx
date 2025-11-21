"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [hasCookie, setHasCookie] = React.useState(false);

  // Check for cookie on mount and when session changes
  React.useEffect(() => {
    const checkCookie = () => {
      if (typeof document === "undefined") return false;
      const cookies = document.cookie.split(";");
      return cookies.some(
        (cookie) =>
          cookie.trim().startsWith("better-auth.session_token=") ||
          cookie.trim().startsWith("better-auth.session=") ||
          cookie.trim().startsWith("session=")
      );
    };
    setHasCookie(checkCookie());
  }, [session, isPending]);

  useEffect(() => {
    // Only redirect if:
    // 1. Not pending (wait for Better Auth to finish loading)
    // 2. No session from Better Auth
    // 3. No cookie exists (meaning truly not authenticated)
    // 4. Haven't redirected yet
    // 5. Not already on sign-in page
    // IMPORTANT: If a cookie exists, don't redirect - the session might just be loading
    if (
      !isPending &&
      !session &&
      !hasCookie &&
      !hasRedirected.current &&
      pathname !== "/auth/sign-in"
    ) {
      hasRedirected.current = true;
      router.push("/auth/sign-in");
    }
  }, [isPending, session, router, pathname, hasCookie]);

  // Show loading if pending OR if no session but cookie exists (session might be loading)
  if (isPending || (!session && hasCookie)) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r bg-muted/40">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Only show null/redirect if no session AND no cookie
  if (!session && !hasCookie) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
