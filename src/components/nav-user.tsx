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
import { useRouter } from "next/navigation";
import { User, UserRole } from "@prisma/client";
import { authClient } from "../lib/auth-client";
import { toast } from "sonner";

export function NavUser({ user }: { user: User }) {
  const router = useRouter();
  const nameFallback = user.email?.split("@")[0] || "User";

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
    const { error } = await authClient.revokeSessions();
    if (error) {
      toast.error(error.message || "Failed to log out");
    } else {
      toast.success("Logged out successfully");
      router.push("/auth/sign-in");
    }
  };
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
            <DropdownMenuItem
              onClick={handleLogout}
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
