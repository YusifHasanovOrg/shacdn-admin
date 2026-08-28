import { PERMISSIONS } from "@/lib/auth/constants";

export type RoutePermissionRule = {
  pattern: RegExp;
  read?: string;
  write?: string;
};

export const ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
  {
    pattern: /^\/dashboard\/example\/products\/new$/,
    write: PERMISSIONS.productsWrite,
  },
  {
    pattern: /^\/dashboard\/example\/products\/[^/]+\/edit$/,
    read: PERMISSIONS.productsRead,
    write: PERMISSIONS.productsWrite,
  },
  {
    pattern: /^\/dashboard\/example\/products$/,
    read: PERMISSIONS.productsRead,
  },
  {
    pattern: /^\/dashboard\/users$/,
    read: PERMISSIONS.usersRead,
  },
  {
    pattern: /^\/dashboard\/roles$/,
    read: PERMISSIONS.rolesRead,
  },
  {
    pattern: /^\/dashboard(?:\/|$)/,
    read: PERMISSIONS.dashboardRead,
  },
];

export function getRoutePermissionRequirement(pathname: string) {
  for (const rule of ROUTE_PERMISSION_RULES) {
    if (!rule.pattern.test(pathname)) continue;
    return rule;
  }
  return null;
}

export function pathnameRequiresWrite(pathname: string) {
  return Boolean(getRoutePermissionRequirement(pathname)?.write);
}

export function pathnameRequiresRead(pathname: string) {
  return Boolean(getRoutePermissionRequirement(pathname)?.read);
}
