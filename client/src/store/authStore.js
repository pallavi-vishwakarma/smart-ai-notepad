/**
 * Auth Store - Zustand state management for authentication
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/authApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await authApi.login(email, password);
          set({ user: data.user, token: data.token, loading: false });
          return true;
        } catch (err) {
          set({ error: err.message, loading: false });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await authApi.register(name, email, password);
          set({ user: data.user, token: data.token, loading: false });
          return true;
        } catch (err) {
          set({ error: err.message, loading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      updatePreferences: (preferences) => {
        const user = get().user;
        if (user) set({ user: { ...user, preferences } });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
