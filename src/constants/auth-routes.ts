export const ROLE_HOME_ROUTES: Record<string, string> = {
  SUPERADMIN: "/superadmin/dashboard",
  ADMIN: "/admin/dashboard",
  COMELEC: "/comelec/dashboard",
  POLL_WATCHER: "/poll-watcher/dashboard",
  USER: "/user/dashboard",
};

export const ROUTE_ROLE_GUARDS: Array<{
  prefix: string;
  roles: string[];
}> = [
  { prefix: "/superadmin", roles: ["SUPERADMIN"] },
  { prefix: "/admin", roles: ["SUPERADMIN", "ADMIN"] },
  { prefix: "/comelec", roles: ["SUPERADMIN", "ADMIN", "COMELEC"] },
  { prefix: "/poll-watcher", roles: ["SUPERADMIN", "POLL_WATCHER"] },
  { prefix: "/user", roles: ["USER"] },
];
