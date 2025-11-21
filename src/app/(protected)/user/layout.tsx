/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import CompleteFormModal from "@/components/complete-form-modal";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Extract user from nested session structure
  // Better Auth returns { session: { user: ... } } or { user: ... }
  const sessionData = session as any;
  const user = sessionData?.session?.user || sessionData?.user || null;

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/sign-in");
    }
  }, [isPending, session, router]);

  const shouldShowCompleteForm = useMemo(() => {
    if (!user) return false;

    const { userType, year, course, section, institute, department, unit } =
      user as any;

    if (userType === "STUDENT") {
      return !year || !course || !section;
    }

    if (userType === "FACULTY") {
      return !institute || !department;
    }

    if (userType === "NON_TEACHING") {
      return !unit;
    }

    return false;
  }, [user]);

  if (isPending) {
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

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
          {shouldShowCompleteForm && <CompleteFormModal />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
