export const ROLE_CONFIG = {
  SUPERADMIN: {
    prefix: "/superadmin",
    dashboard: "/superadmin/dashboard",
  },
  ADMIN: {
    prefix: "/admin",
    dashboard: "/admin/dashboard",
  },
  COMELEC: {
    prefix: "/comelec",
    dashboard: "/comelec/dashboard",
  },
  POLL_WATCHER: {
    prefix: "/poll-watcher",
    dashboard: "/poll-watcher/dashboard",
  },
  USER: {
    prefix: "/user",
    dashboard: "/user/dashboard",
  },
} as const;

export type UserRole = keyof typeof ROLE_CONFIG;
