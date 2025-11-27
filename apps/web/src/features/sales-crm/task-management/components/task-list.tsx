"use client";

import { useState } from "react";
import { Calendar, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useTaskList } from "../hooks/useTaskList";
import type { Task } from "../types";
import { TaskForm } from "./task-form";
import { TaskCard } from "./task-card";
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

  const [selectedTaskIdForDetail, setSelectedTaskIdForDetail] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleViewTask = (taskId: string) => {
    setSelectedTaskIdForDetail(taskId);
    setIsDetailDialogOpen(true);
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
        <TaskCard
          task={row}
          onEdit={() => setEditingTaskId(row.id)}
          onDelete={() => handleDeleteClick(row.id)}
          onComplete={() => handleComplete(row.id)}
          onClickTitle={() => handleViewTask(row.id)}
        />
      ),
    },
    {
      id: "due_date",
      header: t("table.columnDueDate"),
      accessor: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.due_date)}</span>
      ),
      className: "w-[120px] text-right align-top pt-4",
    },
  ];

  const currentRange: DateRange | undefined =
    startDueDate && endDueDate
      ? {
          from: new Date(`${startDueDate}T00:00:00`),
          to: new Date(`${endDueDate}T00:00:00`),
        }
      : startDueDate
        ? {
            from: new Date(`${startDueDate}T00:00:00`),
            to: undefined,
          }
        : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
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
            <SelectTrigger className="w-[180px] h-9">
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

          <Select
            value={accountId || "all"}
            onValueChange={(value) => setAccountId(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder={t("filters.accountPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.accountAll")}</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <DateRangePicker
              dateRange={currentRange}
              onDateChange={(range) => {
                if (range?.from) {
                  const fromDate = new Date(range.from);
                  fromDate.setHours(0, 0, 0, 0);
                  const fromStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(
                    2,
                    "0",
                  )}-${String(fromDate.getDate()).padStart(2, "0")}`;
                  setStartDueDate(fromStr);

                  if (range.to) {
                    const toDate = new Date(range.to);
                    toDate.setHours(0, 0, 0, 0);
                    const toStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(
                      2,
                      "0",
                    )}-${String(toDate.getDate()).padStart(2, "0")}`;
                    setEndDueDate(toStr);
                  } else {
                    setEndDueDate("");
                  }
                } else {
                  setStartDueDate("");
                  setEndDueDate("");
                }
              }}
            />
          </div>
        </div>

        <Button type="button" onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("buttons.addTask")}
        </Button>
      </div>

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
      />

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("buttons.createTitle")}</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleCreate}
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
              onSubmit={handleUpdate}
              onCancel={() => setEditingTaskId(null)}
              isLoading={updateTask.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

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


