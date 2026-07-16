import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  serverError: string | null;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setServerError: (error: string | null) => void;

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
      serverError: null,

      setUser: (user) => set({ user, isAuthenticated: true, serverError: null }),
      clearUser: () => set({ user: null, isAuthenticated: false, serverError: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setServerError: (error) => set({ serverError: error }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const user = await _loginFn(email, password);
          set({ user, isAuthenticated: true, serverError: null });
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
          set({ user, isAuthenticated: true, serverError: null });
        } catch (err: any) {
          const isUnauthorized = err?.status === 401 || err?.message?.includes("401") || err?.message?.toLowerCase().includes("authentication required");

          if (isUnauthorized) {
            set({ user: null, isAuthenticated: false, serverError: null });
          } else if (err?.message.includes("connect ECONNREFUSED")) {

            set({ serverError: err?.message || "Unable to connect to the server." });
            toast.error("Unable to connect to the server. Please check your connection or try again later.", {
              description: err?.message,
            });
          } else {

          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "tf-auth-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
