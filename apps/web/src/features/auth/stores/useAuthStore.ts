"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthState } from "../types";
import type { AuthError } from "../types/errors";
import { authService } from "../services/authService";

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Refresh the access token using the current refresh token.
   * Kept separate from the `refreshToken` string in `AuthState` to avoid name collisions.
   */
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          if (response.success && response.data) {
            const { user, token, refresh_token } = response.data;
            if (typeof window !== "undefined") {
              localStorage.setItem("token", token);
              localStorage.setItem("refreshToken", refresh_token);
              // Set cookie for middleware
              document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            }
            set({
              user,
              token,
              refreshToken: refresh_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const authError = error as AuthError;
          const errorMessage =
            authError.response?.data?.error?.message ||
            authError.message ||
            "Login failed";
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          // Ignore logout errors
        } finally {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            // Remove cookie
            document.cookie = "token=; path=/; max-age=0";
          }
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshSession: async () => {
        const { refreshToken: currentRefreshToken } = get();
        if (!currentRefreshToken) {
          throw new Error("No refresh token available");
        }
        try {
          const response = await authService.refreshToken(currentRefreshToken);
          if (response.success && response.data) {
            const { user, token, refresh_token } = response.data;
            if (typeof window !== "undefined") {
              localStorage.setItem("token", token);
              localStorage.setItem("refreshToken", refresh_token);
              // Update cookie
              document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            }
            set({
              user,
              token,
              refreshToken: refresh_token,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        set({ token });
        if (typeof window !== "undefined" && token) {
          localStorage.setItem("token", token);
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, sync state with localStorage
        if (typeof window !== "undefined" && state) {
          const token = localStorage.getItem("token");
          const refreshToken = localStorage.getItem("refreshToken");

          // Priority: Zustand persisted state > localStorage
          // If Zustand has token, use it and sync to localStorage
          if (state.token) {
            // Sync Zustand state to localStorage
            if (!token || token !== state.token) {
              localStorage.setItem("token", state.token);
            }
            if (state.refreshToken && (!refreshToken || refreshToken !== state.refreshToken)) {
              localStorage.setItem("refreshToken", state.refreshToken);
            }
            // Set authenticated if we have token
            if (!state.isAuthenticated) {
              state.isAuthenticated = true;
            }
            // Set cookie if not exists
            if (!document.cookie.includes("token=")) {
              document.cookie = `token=${state.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            }
          } else if (token) {
            // No Zustand token but localStorage has it, restore from localStorage
            state.token = token;
            if (refreshToken) {
              state.refreshToken = refreshToken;
            }
            state.isAuthenticated = true;
            // Set cookie if not exists
            if (!document.cookie.includes("token=")) {
              document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            }
          } else if (!token && state.isAuthenticated) {
            // No token anywhere but store says authenticated, clear it
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.refreshToken = null;
          }
        }
      },
    }
  )
);

