"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useRoles,
  useDeleteRole,
  useCreateRole,
  useUpdateRole,
  useRole,
} from "./useRoles";
import type { CreateRoleFormData, UpdateRoleFormData } from "../schemas/role.schema";

export function useRoleList() {
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [assigningPermissions, setAssigningPermissions] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading } = useRoles();
  const deleteRole = useDeleteRole();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const roles = data?.data || [];
  const { data: editingRoleData } = useRole(editingRole || "");
  const roleForEdit = editingRoleData;

  const handleCreate = async (formData: CreateRoleFormData) => {
    try {
      await createRole.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("Role berhasil dibuat");
    } catch (error) {
      // Error sudah dihandle di api-client interceptor
    }
  };

  const handleUpdate = async (formData: UpdateRoleFormData) => {
    if (editingRole) {
      try {
        await updateRole.mutateAsync({ id: editingRole, data: formData });
        setEditingRole(null);
        toast.success("Role berhasil diperbarui");
      } catch (error) {
        // Error sudah dihandle di api-client interceptor
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole.mutateAsync(id);
        toast.success("Role berhasil dihapus");
      } catch (error) {
        // Error sudah dihandle di api-client interceptor
      }
    }
  };

  return {
    // State
    editingRole,
    setEditingRole,
    assigningPermissions,
    setAssigningPermissions,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    // Data
    roles,
    roleForEdit,
    isLoading,
    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    // Mutations
    deleteRole,
    createRole,
    updateRole,
  };
}

