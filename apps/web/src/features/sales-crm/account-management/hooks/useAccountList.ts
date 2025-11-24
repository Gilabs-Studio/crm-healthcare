"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useAccounts,
  useDeleteAccount,
  useAccount,
  useCreateAccount,
  useUpdateAccount,
} from "./useAccounts";
import type { CreateAccountFormData, UpdateAccountFormData } from "../schemas/account.schema";

export function useAccountList() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const { data, isLoading } = useAccounts({
    page,
    per_page: perPage,
    search,
    status,
    category,
    assigned_to: assignedTo,
  });
  const { data: editingAccountData } = useAccount(editingAccount || "");
  const deleteAccount = useDeleteAccount();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const accounts = data?.data || [];
  const pagination = data?.meta?.pagination;

  const handleCreate = async (formData: CreateAccountFormData) => {
    try {
      await createAccount.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("Account created successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const handleUpdate = async (formData: UpdateAccountFormData) => {
    if (editingAccount) {
      try {
        await updateAccount.mutateAsync({ id: editingAccount, data: formData });
        setEditingAccount(null);
        toast.success("Account updated successfully");
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount.mutateAsync(id);
      toast.success("Account deleted successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
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
    category,
    setCategory,
    assignedTo,
    setAssignedTo,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingAccount,
    setEditingAccount,
    deletingAccountId,
    setDeletingAccountId,
    // Data
    accounts,
    pagination,
    editingAccountData,
    isLoading,
    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    // Mutations
    deleteAccount,
    createAccount,
    updateAccount,
  };
}

