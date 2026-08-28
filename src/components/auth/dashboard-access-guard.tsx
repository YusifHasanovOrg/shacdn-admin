"use client";

import { useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { isAuthenticated } from "@/lib/auth/tokens";
import { userHasRouteAccess } from "@/navigation/sidebar/filter-sidebar-items";
import { useAuthInitialized, useAuthUser } from "@/stores/auth/auth-provider";

export function DashboardAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const initialized = useAuthInitialized();
  const user = useAuthUser();
  const writeRoute = pathname.includes("/new") || pathname.endsWith("/edit");

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated()) {
      router.replace(`/auth/v2/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user && !userHasRouteAccess(user, pathname, writeRoute)) {
      router.replace("/unauthorized");
    }
  }, [initialized, pathname, router, user, writeRoute]);

  if (!initialized) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">
        Loading session…
      </div>
    );
  }

  if (!user || !userHasRouteAccess(user, pathname, writeRoute)) {
    return null;
  }

  return children;
}
