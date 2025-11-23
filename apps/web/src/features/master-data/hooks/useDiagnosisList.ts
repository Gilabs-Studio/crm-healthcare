"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useDiagnoses,
  useDeleteDiagnosis,
  useDiagnosis,
  useCreateDiagnosis,
  useUpdateDiagnosis,
} from "./useDiagnoses";
import type { CreateDiagnosisFormData, UpdateDiagnosisFormData } from "../schemas/diagnosis.schema";

export function useDiagnosisList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<string | null>(null);

  const { data, isLoading } = useDiagnoses({ page, per_page: 20, search, status });
  const { data: editingDiagnosisData } = useDiagnosis(editingDiagnosis || "");
  const deleteDiagnosis = useDeleteDiagnosis();
  const createDiagnosis = useCreateDiagnosis();
  const updateDiagnosis = useUpdateDiagnosis();

  const diagnoses = data?.data || [];
  const pagination = data?.meta?.pagination;

  const handleCreate = async (formData: CreateDiagnosisFormData) => {
    try {
      await createDiagnosis.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("Diagnosis created successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const handleUpdate = async (formData: UpdateDiagnosisFormData) => {
    if (editingDiagnosis) {
      try {
        await updateDiagnosis.mutateAsync({ id: editingDiagnosis, data: formData });
        setEditingDiagnosis(null);
        toast.success("Diagnosis updated successfully");
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this diagnosis?")) {
      try {
        await deleteDiagnosis.mutateAsync(id);
        toast.success("Diagnosis deleted successfully");
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
    editingDiagnosis,
    setEditingDiagnosis,
    // Data
    diagnoses,
    pagination,
    editingDiagnosisData,
    isLoading,
    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    // Mutations
    deleteDiagnosis,
    createDiagnosis,
    updateDiagnosis,
  };
}

