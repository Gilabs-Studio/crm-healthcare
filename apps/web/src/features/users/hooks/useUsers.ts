"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../stores/useUserStore";
import { userService } from "../services/userService";
import type { ListUsersRequest, CreateUserRequest, UpdateUserRequest } from "../types";

export function useUsers(params?: ListUsersRequest) {
  const { setUsers, setPagination, setLoading, setError } = useUserStore();

  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.list(params);
        if (response.success && Array.isArray(response.data)) {
          setUsers(response.data);
          if (response.meta?.pagination) {
            setPagination(response.meta.pagination);
          }
          return response;
        }
        throw new Error("Failed to fetch users");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch users";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function useUser(id: string) {
  const { setCurrentUser, setLoading, setError } = useUserStore();

  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.getById(id);
        if (response.success && response.data) {
          setCurrentUser(response.data);
          return response;
        }
        throw new Error("Failed to fetch user");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch user";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { addUser, setError } = useUserStore();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        addUser(response.data);
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create user";
      setError(message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { updateUser, setError } = useUserStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.update(id, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        updateUser(variables.id, response.data);
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update user";
      setError(message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { removeUser, setError } = useUserStore();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: (_, id) => {
      removeUser(id);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to delete user";
      setError(message);
    },
  });
}

export function useRoles() {
  const { setRoles, setLoading, setError } = useUserStore();

  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.listRoles();
        if (response.success && response.data) {
          setRoles(response.data);
          return response;
        }
        throw new Error("Failed to fetch roles");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch roles";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function usePermissions() {
  const { setPermissions, setLoading, setError } = useUserStore();

  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.listPermissions();
        if (response.success && response.data) {
          setPermissions(response.data);
          return response;
        }
        throw new Error("Failed to fetch permissions");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch permissions";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();
  const { updateUser, setError } = useUserStore();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { role_ids?: string[]; permission_ids?: string[] };
    }) => userService.updatePermissions(id, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        updateUser(variables.id, response.data);
        queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to update permissions";
      setError(message);
    },
  });
}

