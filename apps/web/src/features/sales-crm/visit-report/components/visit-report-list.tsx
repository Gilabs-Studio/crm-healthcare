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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAccounts } from "../../account-management/hooks/useAccounts";
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";
import type { VisitReport } from "../types";
import type { CreateVisitReportFormData, UpdateVisitReportFormData } from "../schemas/visit-report.schema";
import { useTranslations } from "next-intl";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  submitted: "secondary",
  approved: "default",
  rejected: "destructive",
};

export function VisitReportList() {
  const t = useTranslations("visitReportList");
  
  // Permission checks
  const hasCreatePermission = useHasPermission("CREATE_VISIT_REPORTS");
  const hasEditPermission = useHasPermission("EDIT_VISIT_REPORTS");
  const hasDeletePermission = useHasPermission("DELETE_VISIT_REPORTS");
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
      header: t("table.visitDate"),
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
      header: t("table.account"),
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
      header: t("table.purpose"),
      accessor: (row) => (
        <span className="text-muted-foreground line-clamp-1">{row.purpose}</span>
      ),
    },
    {
      id: "status",
      header: t("table.status"),
      accessor: (row) => (
        <Badge variant={statusColors[row.status] || "outline"}>
          {row.status}
        </Badge>
      ),
      className: "w-[120px]",
    },
    {
      id: "check_in",
      header: t("table.checkIn"),
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
      header: t("table.actions"),
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
          {hasEditPermission && (
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
          )}
          {hasDeletePermission && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDeleteClick(row.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
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
              placeholder={t("filters.searchPlaceholder")}
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
              <SelectValue placeholder={t("filters.allStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
              <SelectItem value="draft">draft</SelectItem>
              <SelectItem value="submitted">submitted</SelectItem>
              <SelectItem value="approved">approved</SelectItem>
              <SelectItem value="rejected">rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={accountId || "all"} 
            onValueChange={(value) => setAccountId(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder={t("filters.allAccounts")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allAccounts")}</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangePicker
            dateRange={
              startDate && endDate
                ? {
                    from: (() => {
                      const d = new Date(startDate + "T00:00:00");
                      d.setHours(0, 0, 0, 0);
                      return d;
                    })(),
                    to: (() => {
                      const d = new Date(endDate + "T00:00:00");
                      d.setHours(0, 0, 0, 0);
                      return d;
                    })(),
                  }
                : startDate
                  ? {
                      from: (() => {
                        const d = new Date(startDate + "T00:00:00");
                        d.setHours(0, 0, 0, 0);
                        return d;
                      })(),
                      to: undefined,
                    }
                  : undefined
            }
            onDateChange={(range) => {
              if (range?.from) {
                const fromDate = new Date(range.from);
                fromDate.setHours(0, 0, 0, 0);
                const fromStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}`;
                setStartDate(fromStr);
                
                if (range.to) {
                  const toDate = new Date(range.to);
                  toDate.setHours(0, 0, 0, 0);
                  const toStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
                  setEndDate(toStr);
                } else {
                  setEndDate("");
                }
              } else {
                setStartDate("");
                setEndDate("");
              }
            }}
          />
        </div>
        {hasCreatePermission && (
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("buttons.addVisitReport")}
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={visitReports}
        isLoading={isLoading}
        emptyMessage={t("empty.table")}
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
        itemName={t("dialogs.itemName")}
        perPageOptions={[10, 20, 50, 100]}
        onResetFilters={() => {
          setSearch("");
          setStatus("");
          setAccountId("");
          setStartDate("");
          setEndDate("");
          setPage(1);
        }}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("dialogs.createTitle")}</DialogTitle>
          </DialogHeader>
          <VisitReportForm
            onSubmit={async (data) => {
              await handleCreate(data as CreateVisitReportFormData);
            }}
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
            <DialogTitle>{t("dialogs.editTitle")}</DialogTitle>
            </DialogHeader>
            <VisitReportForm
              visitReport={editingVisitReportData.data}
            onSubmit={(data) => handleUpdate(data)}
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
        title={t("dialogs.deleteTitle")}
        description={t("dialogs.deleteDescription")}
        itemName={t("dialogs.itemName")}
        isLoading={deleteVisitReport.isPending}
      />
    </div>
  );
}

