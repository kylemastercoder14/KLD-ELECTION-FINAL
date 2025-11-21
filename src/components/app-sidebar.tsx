/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { authClient } from "@/lib/auth-client";
import {
  BarChart3,
  Vote,
  Settings,
  Calendar,
  UserCheck,
  Trophy,
  Shield,
  Sun,
  Moon,
  Building,
  UserCog,
  Database,
  LayoutPanelTop,
  UserPlus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = {
  SUPERADMIN: [
    { title: "Dashboard", url: "/superadmin/dashboard", icon: BarChart3 },
    { title: "Elections", url: "/superadmin/election", icon: Calendar },
    { title: "Partylist", url: "/superadmin/party-list", icon: Building },
    { title: "Candidates", url: "/superadmin/candidates", icon: UserCheck },
    { title: "Accounts", url: "/superadmin/accounts", icon: UserCog },
    { title: "System Logs", url: "/superadmin/logs", icon: Shield },
    { title: "Backup/Restore Database", url: "/superadmin/backup-database", icon: Database },
    { title: "Settings", url: "/superadmin/settings", icon: Settings },
  ],
  ADMIN: [
    { title: "Dashboard", url: "/admin/dashboard", icon: BarChart3 },
    { title: "Elections", url: "/admin/election", icon: Calendar },
    { title: "Partylist", url: "/admin/party-list", icon: Building },
    { title: "Candidates", url: "/admin/candidates", icon: UserCheck },
    { title: "Accounts", url: "/admin/accounts", icon: UserCog },
  ],
  COMELEC: [
    { title: "Dashboard", url: "/comelec/dashboard", icon: BarChart3 },
    { title: "Elections", url: "/comelec/election", icon: Vote },
    { title: "Partylist", url: "/comelec/party-list", icon: Building },
    { title: "Position Templates", url: "/comelec/position-templates", icon: LayoutPanelTop },
    { title: "Candidates", url: "/comelec/candidates", icon: UserCheck },
  ],
  POLL_WATCHER: [
    { title: "Dashboard", url: "/poll-watcher/dashboard", icon: BarChart3 },
    { title: "Monitor Elections", url: "/poll-watcher/election", icon: Vote },
    { title: "Candidates", url: "/poll-watcher/candidates", icon: UserCheck },
  ],
  USER: [
    { title: "Dashboard", url: "/user/dashboard", icon: BarChart3 },
    { title: "Elections", url: "/user/election", icon: Vote },
    { title: "Candidacy Application", url: "/user/candidacy-application", icon: UserPlus },
    { title: "My Votes", url: "/user/votes", icon: Trophy },
  ],
};

export function AppSidebar() {
  const { data: session, isPending } = authClient.useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
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
    console.log("AppSidebar - Session:", session);
    console.log("AppSidebar - User:", user);
    console.log("AppSidebar - IsPending:", isPending);
    console.log("AppSidebar - UserRole:", userRole);
  }, [session, user, isPending, userRole]);

  // Show loading state while session is being fetched
  if (isPending) {
    return (
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative">
              <Image
                src="/kld-logo.webp"
                alt="KLD Logo"
                fill
                className="size-full"
              />
            </div>
            <div>
              <h2 className="font-semibold text-sm">KLD Election</h2>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (!user) {
    console.log("AppSidebar - No user, returning null");
    return null;
  }

  // Get role from session or fetched role, default to USER
  // This allows the sidebar to render immediately with USER menu while role is being fetched
  const role = (user as any).role || userRole || "USER";

  const userMenuItems =
    menuItems[role as keyof typeof menuItems] || menuItems.USER;

  // Function to handle the switch change
  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  // Determine if the switch should be checked (i.e., dark mode is active)
  const isDarkMode = theme === "dark";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative">
            <Image
              src="/kld-logo.webp"
              alt="KLD Logo"
              fill
              className="size-full"
            />
          </div>
          <div>
            <h2 className="font-semibold text-sm">KLD Election</h2>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url || pathname.startsWith(`${item.url}/`)
                    }
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Use a flex container to align the label, icon, and switch */}
            <div className="flex items-center justify-between w-full py-2 px-3">
              <Label
                htmlFor="theme-switch"
                className="flex items-center gap-2 cursor-pointer"
              >
                {isDarkMode ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
              </Label>
              <Switch
                id="theme-switch"
                checked={isDarkMode}
                onCheckedChange={handleThemeChange}
                aria-label="Toggle theme"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
