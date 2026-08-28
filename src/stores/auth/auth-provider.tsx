"use client";

import { createContext, use, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useStore } from "zustand";

import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/types";
import { clearTokens, getRefreshToken, isAuthenticated, setTokens } from "@/lib/auth/tokens";
import { type AuthStore, createAuthStore } from "@/stores/auth/auth-store";

const AuthStoreContext = createContext<AuthStore | null>(null);

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AuthStore>(() => createAuthStore());

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!isAuthenticated()) {
        store.getState().setInitialized(true);
        return;
      }

      store.getState().setLoading(true);
      try {
        const user = await authApi.me();
        if (!cancelled) store.getState().setUser(user);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            try {
              const session = await authApi.refresh(refreshToken);
              setTokens(session.access_token, session.refresh_token);
              store.getState().setUser(session.user);
              return;
            } catch {
              clearTokens();
            }
          }
        }
        clearTokens();
        store.getState().reset();
      } finally {
        if (!cancelled) {
          store.getState().setLoading(false);
          store.getState().setInitialized(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [store]);

  return <AuthStoreContext.Provider value={store}>{children}</AuthStoreContext.Provider>;
}

export function useAuthStore<T>(selector: (state: ReturnType<AuthStore["getState"]>) => T): T {
  const store = use(AuthStoreContext);
  if (!store) throw new Error("Missing AuthStoreProvider");
  return useStore(store, selector);
}

export function useAuthActions() {
  const router = useRouter();
  const store = use(AuthStoreContext);
  if (!store) throw new Error("Missing AuthStoreProvider");

  return {
    async login(email: string, password: string) {
      store.getState().setLoading(true);
      try {
        const session = await authApi.login({ email, password });
        setTokens(session.access_token, session.refresh_token);
        store.getState().setUser(session.user);
        store.getState().setInitialized(true);
        router.push("/dashboard/default");
      } catch (error) {
        store.getState().setLoading(false);
        throw error;
      } finally {
        store.getState().setLoading(false);
      }
    },
    async logout() {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch {
          // Clear local session even if revoke fails.
        }
      }
      clearTokens();
      store.getState().reset();
      router.push("/auth/v2/login");
    },
  };
}

export function useAuthUser() {
  return useAuthStore((state) => state.user);
}

export function useAuthInitialized() {
  return useAuthStore((state) => state.initialized);
}

export function useAuthLoading() {
  return useAuthStore((state) => state.loading);
}
