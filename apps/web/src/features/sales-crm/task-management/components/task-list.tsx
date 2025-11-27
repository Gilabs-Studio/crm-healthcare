"use client";

import { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, CheckCircle2, Calendar as CalendarIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useTaskList } from "../hooks/useTaskList";
import type { Task } from "../types";
import { TaskForm } from "./task-form";
import { TaskDetailModal } from "./task-detail-modal";
import { useUsers } from "@/features/master-data/user-management/hooks/useUsers";
import { useAccounts } from "@/features/sales-crm/account-management/hooks/useAccounts";
import { useTranslations } from "next-intl";

export function TaskList() {
  const t = useTranslations("taskManagement.list");

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    type,
    setType,
    assignedTo,
    setAssignedTo,
    accountId,
    setAccountId,
    startDueDate,
    setStartDueDate,
    endDueDate,
    setEndDueDate,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingTaskId,
    setEditingTaskId,
    deletingTaskId,
    setDeletingTaskId,
    tasks,
    pagination,
    editingTaskData,
    isLoading,
    handleCreate,
    handleUpdate,
    handleComplete,
    handleDeleteClick,
    handleDeleteConfirm,
    createTask,
    updateTask,
    deleteTask,
  } = useTaskList();

  const { data: usersData } = useUsers({ status: "active", per_page: 100 });
  const users = usersData?.data ?? [];

  const { data: accountsData } = useAccounts({ status: "active", per_page: 100 });
  const accounts = accountsData?.data ?? [];

  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewTask = (taskId: string) => {
    setViewingTaskId(taskId);
    setIsDetailModalOpen(true);
  };

  const statusVariantMap: Record<Task["status"], "default" | "secondary" | "outline" | "destructive"> = {
    pending: "outline",
    in_progress: "secondary",
    completed: "default",
    cancelled: "destructive",
  };

  const priorityVariantMap: Record<Task["priority"], "default" | "secondary" | "outline" | "destructive"> = {
    low: "outline",
    medium: "secondary",
    high: "default",
    urgent: "destructive",
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: Column<Task>[] = [
    {
      id: "title",
      header: t("table.columnTask"),
      accessor: (row) => (
        <button
          onClick={() => handleViewTask(row.id)}
          className="font-medium text-primary hover:underline text-left"
        >
          {row.title}
        </button>
      ),
      className: "w-[250px]",
    },
    {
      id: "contact",
      header: t("table.columnContact"),
      accessor: (row) =>
        row.contact ? (
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            // detail modal contact akan di-handle di level yang lebih tinggi bila diperlukan
          >
            {row.contact.name}
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
      className: "w-[160px]",
    },
    {
      id: "type",
      header: t("table.columnType"),
      accessor: (row) => (
        <Badge variant="outline" className="font-normal">
          {row.type.replace("_", " ")}
        </Badge>
      ),
      className: "w-[100px]",
    },
    {
      id: "status",
      header: t("table.columnStatus"),
      accessor: (row) => (
        <Badge variant={statusVariantMap[row.status]} className="font-normal">
          {row.status.replace("_", " ")}
        </Badge>
      ),
      className: "w-[120px]",
    },
    {
      id: "priority",
      header: t("table.columnPriority"),
      accessor: (row) => (
        <Badge variant={priorityVariantMap[row.priority]} className="font-normal">
          {row.priority}
        </Badge>
      ),
      className: "w-[100px]",
    },
    {
      id: "assigned_to",
      header: t("table.columnAssignee"),
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {row.assigned_user ? (
            <>
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{row.assigned_user.name}</span>
            </>
          ) : (
            <span>-</span>
          )}
        </div>
      ),
      className: "w-[150px]",
    },
    {
      id: "due_date",
      header: t("table.columnDueDate"),
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {row.due_date ? (
            <>
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formatDate(row.due_date)}</span>
            </>
          ) : (
            <span>-</span>
          )}
        </div>
      ),
      className: "w-[140px]",
    },
    {
      id: "actions",
      header: t("table.columnActions"),
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8"
            title="View Details"
            onClick={() => handleViewTask(row.id)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {row.status !== "completed" && row.status !== "cancelled" && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => handleComplete(row.id)}
              title={t("buttons.markComplete")}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditingTaskId(row.id)}
            className="h-8 w-8"
            title="Edit"
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
      className: "w-[160px] text-right",
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
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10 h-9"
            />
          </div>

          <Select
            value={status || "all"}
            onValueChange={(value) => setStatus(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder={t("filters.statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.statusAll")}</SelectItem>
              <SelectItem value="pending">{t("filters.statusPending")}</SelectItem>
              <SelectItem value="in_progress">{t("filters.statusInProgress")}</SelectItem>
              <SelectItem value="completed">{t("filters.statusCompleted")}</SelectItem>
              <SelectItem value="cancelled">{t("filters.statusCancelled")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priority || "all"}
            onValueChange={(value) => setPriority(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder={t("filters.priorityPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.priorityAll")}</SelectItem>
              <SelectItem value="low">{t("filters.priorityLow")}</SelectItem>
              <SelectItem value="medium">{t("filters.priorityMedium")}</SelectItem>
              <SelectItem value="high">{t("filters.priorityHigh")}</SelectItem>
              <SelectItem value="urgent">{t("filters.priorityUrgent")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type || "all"} onValueChange={(value) => setType(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder={t("filters.typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.typeAll")}</SelectItem>
              <SelectItem value="general">{t("filters.typeGeneral")}</SelectItem>
              <SelectItem value="call">{t("filters.typeCall")}</SelectItem>
              <SelectItem value="email">{t("filters.typeEmail")}</SelectItem>
              <SelectItem value="meeting">{t("filters.typeMeeting")}</SelectItem>
              <SelectItem value="follow_up">{t("filters.typeFollowUp")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={assignedTo || "all"}
            onValueChange={(value) => setAssignedTo(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder={t("filters.assigneePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.assigneeAll")}</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* account & date filters disembunyikan untuk tampilan yang lebih ringkas */}
        </div>

        <Button type="button" onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("buttons.addTask")}
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        emptyMessage={t("table.empty")}
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
        itemName={t("table.itemName")}
        perPageOptions={[10, 20, 50, 100]}
        onResetFilters={() => {
          setSearch("");
          setStatus("");
          setPriority("");
          setType("");
          setAssignedTo("");
          setAccountId("");
          setStartDueDate("");
          setEndDueDate("");
          setPage(1);
        }}
      />

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("buttons.createTitle")}</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={async (data) => {
              await handleCreate(data as any);
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createTask.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      {editingTaskId && editingTaskData?.data && (
        <Dialog open={!!editingTaskId} onOpenChange={(open) => !open && setEditingTaskId(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("buttons.editTitle")}</DialogTitle>
            </DialogHeader>
            <TaskForm
              task={editingTaskData.data}
              onSubmit={async (data) => {
                await handleUpdate(data as any);
              }}
              onCancel={() => setEditingTaskId(null)}
              isLoading={updateTask.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={viewingTaskId}
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          setIsDetailModalOpen(open);
          if (!open) {
            setViewingTaskId(null);
          }
        }}
        onTaskUpdated={() => {
          // Refresh handled by query invalidation
        }}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingTaskId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTaskId(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description")}
        itemName={t("table.itemName")}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}


