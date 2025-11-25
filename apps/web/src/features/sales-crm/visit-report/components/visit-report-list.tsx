"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Search, Eye, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVisitReportList } from "../hooks/useVisitReportList";
import { VisitReportForm } from "./visit-report-form";
import { VisitReportDetailModal } from "./visit-report-detail-modal";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAccounts } from "../../account-management/hooks/useAccounts";
import type { VisitReport } from "../types";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  submitted: "secondary",
  approved: "default",
  rejected: "destructive",
};

export function VisitReportList() {
  const {
    page,
    setPage,
    setPerPage,
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
    visitReports,
    pagination,
    editingVisitReportData,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    deletingVisitReportId,
    setDeletingVisitReportId,
    deleteVisitReport,
    createVisitReport,
    updateVisitReport,
  } = useVisitReportList();

  const { data: accountsData } = useAccounts({ per_page: 100 });
  const accounts = accountsData?.data || [];

  const [viewingVisitReportId, setViewingVisitReportId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewVisitReport = (id: string) => {
    setViewingVisitReportId(id);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: Column<VisitReport>[] = [
    {
      id: "visit_date",
      header: "Visit Date",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.visit_date)}</span>
        </div>
      ),
      className: "w-[150px]",
    },
    {
      id: "account",
      header: "Account",
      accessor: (row) => (
        <button
          onClick={() => handleViewVisitReport(row.id)}
          className="font-medium text-primary hover:underline text-left"
        >
          {row.account?.name || "N/A"}
        </button>
      ),
      className: "w-[200px]",
    },
    {
      id: "purpose",
      header: "Purpose",
      accessor: (row) => (
        <span className="text-muted-foreground line-clamp-1">{row.purpose}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <Badge variant={statusColors[row.status] || "outline"}>
          {row.status}
        </Badge>
      ),
      className: "w-[120px]",
    },
    {
      id: "check_in",
      header: "Check In",
      accessor: (row) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {row.check_in_time ? (
            <>
              <MapPin className="h-3 w-3" />
              <span>{new Date(row.check_in_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
            </>
          ) : (
            <span>-</span>
          )}
        </div>
      ),
      className: "w-[120px]",
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8"
            title="View Details"
            onClick={() => handleViewVisitReport(row.id)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditingVisitReport(row.id)}
            className="h-8 w-8"
            title="Edit"
            disabled={row.status !== "draft" && row.status !== "submitted"}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDeleteClick(row.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      className: "w-[140px] text-right",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search visit reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Select 
            value={status || "all"} 
            onValueChange={(value) => setStatus(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={accountId || "all"} 
            onValueChange={(value) => setAccountId(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
            className="h-9 w-[150px]"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
            className="h-9 w-[150px]"
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Visit Report
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={visitReports}
        isLoading={isLoading}
        emptyMessage="No visit reports found"
        pagination={
          pagination
            ? {
                page: pagination.page,
                per_page: pagination.per_page,
                total: pagination.total,
                total_pages: pagination.total_pages,
                has_next: pagination.has_next,
                has_prev: pagination.has_prev,
              }
            : undefined
        }
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        itemName="visit report"
        perPageOptions={[10, 20, 50, 100]}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Visit Report</DialogTitle>
          </DialogHeader>
          <VisitReportForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createVisitReport.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingVisitReport && editingVisitReportData?.data && (
        <Dialog open={!!editingVisitReport} onOpenChange={(open) => !open && setEditingVisitReport(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Visit Report</DialogTitle>
            </DialogHeader>
            <VisitReportForm
              visitReport={editingVisitReportData.data}
              onSubmit={handleUpdate}
              onCancel={() => setEditingVisitReport(null)}
              isLoading={updateVisitReport.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Visit Report Detail Modal */}
      <VisitReportDetailModal
        visitReportId={viewingVisitReportId}
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          setIsDetailModalOpen(open);
          if (!open) {
            setViewingVisitReportId(null);
          }
        }}
        onVisitReportUpdated={() => {
          // Refresh will be handled by query invalidation in hooks
        }}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingVisitReportId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingVisitReportId(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Visit Report?"
        description={
          deletingVisitReportId
            ? `Are you sure you want to delete this visit report? This action cannot be undone.`
            : "Are you sure you want to delete this visit report? This action cannot be undone."
        }
        itemName="visit report"
        isLoading={deleteVisitReport.isPending}
      />
    </div>
  );
}

