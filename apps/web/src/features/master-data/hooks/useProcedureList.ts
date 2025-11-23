"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useProcedures,
  useDeleteProcedure,
  useProcedure,
  useCreateProcedure,
  useUpdateProcedure,
} from "./useProcedures";
import type { CreateProcedureFormData, UpdateProcedureFormData } from "../schemas/procedure.schema";

export function useProcedureList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<string | null>(null);

  const { data, isLoading } = useProcedures({ page, per_page: 20, search, status });
  const { data: editingProcedureData } = useProcedure(editingProcedure || "");
  const deleteProcedure = useDeleteProcedure();
  const createProcedure = useCreateProcedure();
  const updateProcedure = useUpdateProcedure();

  const procedures = data?.data || [];
  const pagination = data?.meta?.pagination;

  const handleCreate = async (formData: CreateProcedureFormData) => {
    try {
      await createProcedure.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("Procedure created successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const handleUpdate = async (formData: UpdateProcedureFormData) => {
    if (editingProcedure) {
      try {
        await updateProcedure.mutateAsync({ id: editingProcedure, data: formData });
        setEditingProcedure(null);
        toast.success("Procedure updated successfully");
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this procedure?")) {
      try {
        await deleteProcedure.mutateAsync(id);
        toast.success("Procedure deleted successfully");
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  return {
    // State
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingProcedure,
    setEditingProcedure,
    // Data
    procedures,
    pagination,
    editingProcedureData,
    isLoading,
    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    // Mutations
    deleteProcedure,
    createProcedure,
    updateProcedure,
  };
}

