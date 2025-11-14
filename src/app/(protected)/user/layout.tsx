"use client";

import type React from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import CompleteFormModal from "@/components/complete-form-modal";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/sign-in");
    }
  }, [status, router]);

  const shouldShowCompleteForm = useMemo(() => {
    if (!session?.user) return false;

    const { userType, year, course, section, institute, department, unit } =
      session.user;

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
  }, [session]);

  if (status === "loading") {
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
