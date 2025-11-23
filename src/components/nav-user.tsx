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
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@prisma/client";
import { useState } from "react";
import { logoutAction } from "@/actions";
import { Loader2 } from "lucide-react";

export function NavUser({ user }: { user: User }) {
  const router = useRouter();
  const nameFallback = user.email?.split("@")[0] || "User";
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get role from user or fetched role, default to USER
  const role = (user.role || "USER") as UserRole;

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logoutAction();
      if (result.success) {
        router.push(result.redirect || "/auth/sign-in");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };
  return (
    <>
      {/* Loading overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Logging out, please wait...</p>
          </div>
        </div>
      )}
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
          <DropdownMenuItem onClick={handleLogout}>
            <IconLogout />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
