import type React from "react";

import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import CompleteFormModal from "@/components/complete-form-modal";
import { getServerSession } from "@/lib/get-session";
import { User } from "@prisma/client";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // 2. If no user → redirect
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const user = session.user;

  const shouldShowCompleteForm = (() => {
    const { userType, year, course, section, institute, department, unit } =
      user as User;

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
        <SiteHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
          {shouldShowCompleteForm && <CompleteFormModal />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
