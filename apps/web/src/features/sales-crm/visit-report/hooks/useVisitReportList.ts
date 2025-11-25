"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useVisitReports,
  useDeleteVisitReport,
  useVisitReport,
  useCreateVisitReport,
  useUpdateVisitReport,
} from "./useVisitReports";
import type {
  CreateVisitReportFormData,
  UpdateVisitReportFormData,
} from "../schemas/visit-report.schema";

export function useVisitReportList() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVisitReport, setEditingVisitReport] = useState<string | null>(null);
  const [deletingVisitReportId, setDeletingVisitReportId] = useState<string | null>(null);

  const { data, isLoading } = useVisitReports({
    page,
    per_page: perPage,
    search,
    status,
    account_id: accountId,
    start_date: startDate,
    end_date: endDate,
  });
  const { data: editingVisitReportData } = useVisitReport(editingVisitReport || "");
  const deleteVisitReport = useDeleteVisitReport();
  const createVisitReport = useCreateVisitReport();
  const updateVisitReport = useUpdateVisitReport();

  const visitReports = data?.data || [];
  const pagination = data?.meta?.pagination;

  const handleCreate = async (formData: CreateVisitReportFormData) => {
    try {
      await createVisitReport.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("Visit report created successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const handleUpdate = async (formData: UpdateVisitReportFormData) => {
    if (editingVisitReport) {
      try {
        await updateVisitReport.mutateAsync({ id: editingVisitReport, data: formData });
        setEditingVisitReport(null);
        toast.success("Visit report updated successfully");
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingVisitReportId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deletingVisitReportId) {
      try {
        await deleteVisitReport.mutateAsync(deletingVisitReportId);
        toast.success("Visit report deleted successfully");
        setDeletingVisitReportId(null);
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
    accountId,
    setAccountId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingVisitReport,
    setEditingVisitReport,
    deletingVisitReportId,
    setDeletingVisitReportId,
    // Data
    visitReports,
    pagination,
    editingVisitReportData,
    isLoading,
    // Actions
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    // Mutations
    deleteVisitReport,
    createVisitReport,
    updateVisitReport,
  };
}

