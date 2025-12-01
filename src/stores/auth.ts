import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
type Role = 'admin' | 'editor' | 'guest';
interface AuthState {
  user: { name: string; role: Role } | null;
  isAuthenticated: boolean;
  login: (user: { name: string; role: Role }) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
// Selectors for performance
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useUser = () => useAuthStore((state) => state.user);
export const useAuthActions = () => useAuthStore((state) => state);