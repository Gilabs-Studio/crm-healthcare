"use client";

import { create } from "zustand";
import type { User, Role, Permission } from "../types";

interface UserState {
  users: User[];
  currentUser: User | null;
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
}

interface UserActions {
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  removeUser: (id: string) => void;
  setRoles: (roles: Role[]) => void;
  setPermissions: (permissions: Permission[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: UserState["pagination"]) => void;
  reset: () => void;
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  users: [],
  currentUser: null,
  roles: [],
  permissions: [],
  isLoading: false,
  error: null,
  pagination: null,
};

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,

  setUsers: (users) => set({ users }),

  setCurrentUser: (user) => set({ currentUser: user }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      currentUser:
        state.currentUser?.id === id
          ? { ...state.currentUser, ...updates }
          : state.currentUser,
    })),

  removeUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
      currentUser: state.currentUser?.id === id ? null : state.currentUser,
    })),

  setRoles: (roles) => set({ roles }),

  setPermissions: (permissions) => set({ permissions }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setPagination: (pagination) => set({ pagination }),

  reset: () => set(initialState),
}));

