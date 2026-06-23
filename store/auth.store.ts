import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  email: string;
  name: string;
  role: 'admin' | 'agent';
  initials: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        // Clear the session cookie
        document.cookie = 'tf_mock_session=; path=/; max-age=0';
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'tf-auth-storage',
    }
  )
);
