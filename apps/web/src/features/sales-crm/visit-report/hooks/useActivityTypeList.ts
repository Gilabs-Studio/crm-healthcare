"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useActivityTypes,
  useDeleteActivityType,
  useActivityType,
  useCreateActivityType,
  useUpdateActivityType,
} from "./useActivityTypes";

export function useActivityTypeList() {
  const [editingType, setEditingType] = useState<string | null>(null);
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading } = useActivityTypes();
  const { data: editingTypeData } = useActivityType(editingType || "");
  const deleteType = useDeleteActivityType();
  const createType = useCreateActivityType();
  const updateType = useUpdateActivityType();

  const types = data?.data || [];
  const typeForEdit = editingTypeData?.data;

  const handleCreate = async (formData: {
    name: string;
    code: string;
    description?: string;
    icon?: string;
    badge_color?: string;
    status?: string;
    order?: number;
  }) => {
    try {
      await createType.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("Activity type created successfully");
    } catch {
      // Error already handled in api-client interceptor
    }
  };

  const handleUpdate = async (formData: {
    name?: string;
    code?: string;
    description?: string;
    icon?: string;
    badge_color?: string;
    status?: string;
    order?: number;
  }) => {
    if (editingType) {
      try {
        await updateType.mutateAsync({ id: editingType, data: formData });
        setEditingType(null);
        toast.success("Activity type updated successfully");
      } catch {
        // Error already handled in api-client interceptor
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteType.mutateAsync(id);
      toast.success("Activity type deleted successfully");
    } catch {
      // Error already handled in api-client interceptor
    }
  };

  return {
    // State
    editingType,
    setEditingType,
    deletingTypeId,
    setDeletingTypeId,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    // Data
    types,
    typeForEdit,
    isLoading,
    // Handlers
    handleCreate,
    handleUpdate,
    handleDelete,
    // Mutations
    createType,
    updateType,
    deleteType,
  };
}

