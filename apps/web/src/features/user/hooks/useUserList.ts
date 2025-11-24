"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUsers, useDeleteUser, useUser, useCreateUser, useUpdateUser } from "./useUsers";
import { useRoles } from "./useUsers";
import type { CreateUserFormData, UpdateUserFormData } from "../schemas/user.schema";

export function useUserList() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const { data, isLoading } = useUsers({ page, per_page: perPage, search, status, role_id: roleId });
  const { data: rolesData } = useRoles();
  const { data: editingUserData } = useUser(editingUser || "");
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const users = data?.data || [];
  const pagination = data?.meta?.pagination;
  const roles = rolesData?.data || [];

  const handleCreate = async (formData: CreateUserFormData) => {
    try {
      await createUser.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("User created successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const handleUpdate = async (formData: UpdateUserFormData) => {
    if (editingUser) {
      try {
        await updateUser.mutateAsync({ id: editingUser, data: formData });
        setEditingUser(null);
        toast.success("User updated successfully");
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser.mutateAsync(id);
        toast.success("User deleted successfully");
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page when changing per page
  };

  return {
    // State
    page,
    setPage,
    perPage,
    setPerPage: handlePerPageChange,
    search,
    setSearch,
    status,
    setStatus,
    roleId,
    setRoleId,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingUser,
    setEditingUser,
    // Data
    users,
    pagination,
    roles,
    editingUserData,
    isLoading,
    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    // Mutations
    deleteUser,
    createUser,
    updateUser,
  };
}
