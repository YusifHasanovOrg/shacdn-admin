export const AUTH_COOKIE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
} as const;

export const PERMISSIONS = {
  dashboardRead: "dashboard:read",
  productsRead: "products:read",
  productsWrite: "products:write",
  usersRead: "users:read",
  usersWrite: "users:write",
  rolesRead: "roles:read",
  rolesWrite: "roles:write",
  auditRead: "audit:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEMO_USERS = {
  admin: { email: "admin@example.com", password: "admin123" },
  editor: { email: "editor@example.com", password: "admin123" },
  viewer: { email: "viewer@example.com", password: "viewer123" },
} as const;
