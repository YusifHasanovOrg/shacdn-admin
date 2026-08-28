import { createStore } from "zustand/vanilla";

import type { AuthUser } from "@/lib/auth/permissions";

export type AuthState = {
  user: AuthUser | null;
  initialized: boolean;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export function createAuthStore(initialUser: AuthUser | null = null) {
  return createStore<AuthState>((set) => ({
    user: initialUser,
    initialized: false,
    loading: false,
    setUser: (user) => set({ user }),
    setInitialized: (initialized) => set({ initialized }),
    setLoading: (loading) => set({ loading }),
    reset: () => set({ user: null, loading: false, initialized: true }),
  }));
}

export type AuthStore = ReturnType<typeof createAuthStore>;
