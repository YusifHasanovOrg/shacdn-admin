"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/types";
import { hasPermission } from "@/lib/auth/permissions";
import { isAuthenticated } from "@/lib/auth/tokens";
import { useAuthInitialized, useAuthUser } from "@/stores/auth/auth-provider";

type RequirePermissionProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
};

export function RequirePermission({
  permission,
  children,
  fallback = null,
  redirectTo = "/unauthorized",
}: RequirePermissionProps) {
  const router = useRouter();
  const initialized = useAuthInitialized();
  const user = useAuthUser();
  const allowed = hasPermission(user, permission);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated()) {
      router.replace("/auth/v2/login");
      return;
    }
    if (!allowed) {
      router.replace(redirectTo);
    }
  }, [allowed, initialized, redirectTo, router]);

  if (!initialized || !allowed) {
    return fallback;
  }

  return children;
}

type CanProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ permission, children, fallback = null }: CanProps) {
  const user = useAuthUser();
  if (!hasPermission(user, permission)) {
    return fallback;
  }
  return children;
}

export function usePermission(permission: string) {
  const user = useAuthUser();
  return hasPermission(user, permission);
}

export function useApiErrorHandler() {
  const router = useRouter();

  return (error: unknown) => {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        router.replace("/auth/v2/login");
        return;
      }
      if (error.status === 403) {
        router.replace("/unauthorized");
      }
    }
  };
}
