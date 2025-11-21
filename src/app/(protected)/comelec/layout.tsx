"use client";

import type React from "react";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
	if (!isPending && !session) {
	  router.push("/auth/sign-in");
	}
  }, [isPending, session, router]);

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
		<main className="flex-1 p-6 overflow-auto">{children}</main>
	  </SidebarInset>
	</SidebarProvider>
  );
}
