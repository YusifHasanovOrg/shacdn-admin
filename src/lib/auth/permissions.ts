import type { Permission } from "@/lib/auth/constants";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
};

export function hasPermission(user: AuthUser | null | undefined, permission: Permission | string) {
  return Boolean(user?.permissions.includes(permission));
}

export function hasAnyPermission(user: AuthUser | null | undefined, permissions: string[]) {
  if (!user) return false;
  return permissions.some((permission) => user.permissions.includes(permission));
}

export function hasAllPermissions(user: AuthUser | null | undefined, permissions: string[]) {
  if (!user) return false;
  return permissions.every((permission) => user.permissions.includes(permission));
}

export function canReadResource(user: AuthUser | null | undefined, resource: string) {
  return hasPermission(user, `${resource}:read`);
}

export function canWriteResource(user: AuthUser | null | undefined, resource: string) {
  return hasPermission(user, `${resource}:write`);
}
