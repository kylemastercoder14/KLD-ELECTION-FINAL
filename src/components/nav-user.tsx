/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { useEffect, useState } from "react";

export function NavUser() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Extract user from nested session structure
  // Better Auth returns { session: { user: ... } } or { user: ... }
  const sessionData = session as any;
  const user = sessionData?.session?.user || sessionData?.user || null;

  // Fetch user role from database if not in session
  useEffect(() => {
    if (user?.id) {
      // Check if role exists in session (Better Auth might include it)
      const sessionRole = (user as any).role;

      if (sessionRole) {
        setUserRole(sessionRole);
      } else {
        // Fetch role from API if not in session
        fetch(`/api/users/${user.id}/role`)
          .then((res) => res.json())
          .then((data) => {
            if (data.role) {
              setUserRole(data.role);
            }
          })
          .catch((error) => {
            console.error("Error fetching user role:", error);
          });
      }
    }
  }, [user]);

  // Debug: Log session data
  useEffect(() => {
    console.log("NavUser - Session:", session);
    console.log("NavUser - User:", user);
    console.log("NavUser - IsPending:", isPending);
    console.log("NavUser - UserRole:", userRole);
  }, [session, user, isPending, userRole]);

  // Show loading state while session is being fetched
  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded mt-1" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    console.log("NavUser - No user, returning null");
    return null;
  }
  const nameFallback = user.email?.split("@")[0] || "User";

  // Get role from user or fetched role, default to USER
  const role = ((user as any).role || userRole || "USER") as UserRole;

  let adminPath;
  switch (role) {
    case "ADMIN":
      adminPath = "/admin";
      break;
    case "SUPERADMIN":
      adminPath = "/superadmin";
      break;
    case "COMELEC":
      adminPath = "/comelec";
      break;
    case "POLL_WATCHER":
      adminPath = "/poll-watcher";
      break;
    case "USER":
      adminPath = "/user";
      break;
    default:
      adminPath = "/user";
      break;
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user.image || ""}
                  alt={user.name || nameFallback}
                />
                <AvatarFallback className="rounded-lg">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={"bottom"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.image || ""}
                    alt={user.name || nameFallback}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(`${adminPath}/profile`)}
              >
                <IconUserCircle />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuItem onClick={() => authClient.signOut()}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
