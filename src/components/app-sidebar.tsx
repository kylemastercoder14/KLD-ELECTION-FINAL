"use client";

import { useSession } from "next-auth/react";
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
    { title: "Election", url: "/user/election", icon: Vote },
    { title: "Partylist", url: "/user/party-list", icon: Building },
    { title: "Candidacy Application", url: "/user/candidacy-application", icon: UserPlus },
    { title: "My Votes", url: "/user/votes", icon: Trophy },
  ],
};

export function AppSidebar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  if (!session?.user) return null;

  const userMenuItems =
    menuItems[session.user.role as keyof typeof menuItems] || menuItems.USER;

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
