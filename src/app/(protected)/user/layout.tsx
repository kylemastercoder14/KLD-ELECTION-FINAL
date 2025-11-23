import type React from "react";

import { redirect, unauthorized } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import CompleteFormModal from "@/components/complete-form-modal";
import { getServerSession } from "@/lib/session";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSession();
  if (!user) {
    redirect("/auth/sign-in");
  }

  // Optional: Verify user role if needed
  if (user.role !== "USER") {
    unauthorized();
  }

  const shouldShowCompleteForm = (() => {
    const { userType, year, course, section, institute, department, unit } =
      user;

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
  })();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
          {shouldShowCompleteForm && <CompleteFormModal />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
