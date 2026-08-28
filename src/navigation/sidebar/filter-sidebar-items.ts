import type { AuthUser } from "@/lib/auth/permissions";
import { hasAnyPermission, hasPermission } from "@/lib/auth/permissions";
import type { NavGroup, NavMainItem, NavSubItem } from "@/navigation/sidebar/sidebar-items";

function canSeeNavItem(user: AuthUser | null, permissions?: string[]) {
  if (!permissions?.length) return true;
  return hasAnyPermission(user, permissions);
}

function filterSubItems(user: AuthUser | null, subItems: NavSubItem[]) {
  return subItems.filter((item) => canSeeNavItem(user, item.permissions));
}

function filterMainItems(user: AuthUser | null, items: NavMainItem[]) {
  return items
    .map((item) => {
      if ("subItems" in item && item.subItems) {
        const subItems = filterSubItems(user, item.subItems);
        if (!subItems.length) return null;
        if (!canSeeNavItem(user, item.permissions)) return null;
        return { ...item, subItems };
      }

      if (!canSeeNavItem(user, item.permissions)) return null;
      return item;
    })
    .filter((item): item is NavMainItem => item !== null);
}

export function filterSidebarItems(items: NavGroup[], user: AuthUser | null) {
  return items
    .map((group) => {
      const filteredItems = filterMainItems(user, group.items);
      if (!filteredItems.length) return null;
      return { ...group, items: filteredItems };
    })
    .filter((group): group is NavGroup => group !== null);
}

export function userHasRouteAccess(user: AuthUser | null, pathname: string, write = false) {
  if (!user) return false;

  if (pathname.startsWith("/dashboard/example/products/new")) {
    return hasPermission(user, "products:write");
  }
  if (/^\/dashboard\/example\/products\/[^/]+\/edit$/.test(pathname)) {
    return write ? hasPermission(user, "products:write") : hasPermission(user, "products:read");
  }
  if (pathname.startsWith("/dashboard/example/products")) {
    return hasPermission(user, "products:read");
  }
  if (pathname.startsWith("/dashboard/users")) {
    return write ? hasPermission(user, "users:write") : hasPermission(user, "users:read");
  }
  if (pathname.startsWith("/dashboard/roles/new")) {
    return hasPermission(user, "roles:write");
  }
  if (/^\/dashboard\/roles\/[^/]+\/edit$/.test(pathname)) {
    return write ? hasPermission(user, "roles:write") : hasPermission(user, "roles:read");
  }
  if (pathname.startsWith("/dashboard/roles")) {
    return hasPermission(user, "roles:read");
  }
  if (pathname.startsWith("/dashboard/audit")) {
    return hasPermission(user, "audit:read");
  }
  if (pathname.startsWith("/dashboard")) {
    return hasPermission(user, "dashboard:read");
  }

  return true;
}
