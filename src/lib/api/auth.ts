import { apiRequest } from "@/lib/api/client";
import type { AuthUser } from "@/lib/auth/permissions";

type AuthResponse = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

export const authApi = {
  login(input: { email: string; password: string }) {
    return apiRequest<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: input,
      auth: false,
    });
  },

  refresh(refreshToken: string) {
    return apiRequest<AuthResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
      auth: false,
    });
  },

  me() {
    return apiRequest<AuthUser>("/api/v1/auth/me");
  },

  logout(refreshToken: string) {
    return apiRequest<void>("/api/v1/auth/logout", {
      method: "POST",
      body: { refresh_token: refreshToken },
      auth: false,
    });
  },
};

export type RoleResponse = {
  code: string;
  name: string;
  permissions: string[];
};

export type PermissionResponse = {
  code: string;
  description: string;
};

export const rbacApi = {
  listRoles() {
    return apiRequest<RoleResponse[]>("/api/v1/rbac/roles");
  },

  listPermissions() {
    return apiRequest<PermissionResponse[]>("/api/v1/rbac/permissions");
  },
};
