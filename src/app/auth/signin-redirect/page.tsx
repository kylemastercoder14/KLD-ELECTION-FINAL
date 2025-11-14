/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SignInRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const roleRoutes: Record<string, string> = {
    SUPERADMIN: "/superadmin/dashboard",
    ADMIN: "/admin/dashboard",
    COMELEC: "/comelec/dashboard",
    POLL_WATCHER: "/poll-watcher/dashboard",
    USER: "/user/dashboard",
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/sign-in");
      return;
    }

    if (session?.user) {
      const userStatus = session.user.status;
      const userRole = session.user.role;

      // ✅ Pending users
      if (userStatus === "Pending") {
        router.push("/waiting-approval");
        return;
      }

      // ✅ Dynamic role-based redirect
      const redirectPath = roleRoutes[userRole] ?? "/user/dashboard";
      router.push(redirectPath);
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-image relative p-4">
      <div className="absolute inset-0 -z-1 bg-custom-gradient"></div>
      <Card className="w-full max-w-md relative z-10 text-center p-6">
        <CardContent className="text-center flex flex-col items-center justify-center mx-auto">
          <Loader2 className="size-6 animate-spin" />
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  );
}
