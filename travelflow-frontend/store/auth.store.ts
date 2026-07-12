import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;

  // Async actions (implementations delegated to api-client to avoid circular deps)
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

// These will be injected by the api-client after it's initialised
let _loginFn: (email: string, password: string) => Promise<User>;
let _logoutFn: () => Promise<void>;
let _getMeFn: () => Promise<User>;

export function injectAuthActions(
  loginFn: typeof _loginFn,
  logoutFn: typeof _logoutFn,
  getMeFn: typeof _getMeFn
) {
  _loginFn = loginFn;
  _logoutFn = logoutFn;
  _getMeFn = getMeFn;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      setLoading: (loading) => set({ isLoading: loading }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const user = await _loginFn(email, password);
          set({ user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          if (_logoutFn) await _logoutFn();
        } finally {
          get().clearUser();
          set({ isLoading: false });
        }
      },

      fetchMe: async () => {
        if (!_getMeFn) return;
        set({ isLoading: true });
        try {
          const user = await _getMeFn();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "tf-auth-user",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
