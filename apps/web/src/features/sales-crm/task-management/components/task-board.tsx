"use client";

import { useState } from "react";
import { Columns2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useTaskList } from "../hooks/useTaskList";
import type { Task, TaskStatus } from "../types";
import { TaskForm } from "./task-form";
import { TaskDetailModal } from "./task-detail-modal";
import { useUsers } from "@/features/master-data/user-management/hooks/useUsers";
import { useAccounts } from "@/features/sales-crm/account-management/hooks/useAccounts";
import { TaskCard } from "./task-card";
import { useTranslations } from "next-intl";
import { ContactDetailModal } from "@/features/sales-crm/account-management/components/contact-detail-modal";

const BOARD_STATUSES: TaskStatus[] = ["pending", "in_progress", "completed", "cancelled"];

export function TaskBoard() {
  const tList = useTranslations("taskManagement.list");
  const tBoard = useTranslations("taskManagement.board");

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
  const [viewingContactId, setViewingContactId] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleViewTask = (taskId: string) => {
    setViewingTaskId(taskId);
    setIsDetailModalOpen(true);
  };

  const handleViewContact = (contactId: string) => {
    setViewingContactId(contactId);
    setIsContactModalOpen(true);
  };

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

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    pending: [],
    in_progress: [],
    completed: [],
    cancelled: [],
  };

  tasks.forEach((task) => {
    if (BOARD_STATUSES.includes(task.status)) {
      tasksByStatus[task.status].push(task);
    }
  });

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tList("searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10 h-9"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={status || "all"}
              onValueChange={(value) => setStatus(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[120px] h-9 text-xs">
                <SelectValue placeholder={tList("filters.statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tList("filters.statusAll")}</SelectItem>
                <SelectItem value="pending">{tList("filters.statusPending")}</SelectItem>
                <SelectItem value="in_progress">{tList("filters.statusInProgress")}</SelectItem>
                <SelectItem value="completed">{tList("filters.statusCompleted")}</SelectItem>
                <SelectItem value="cancelled">{tList("filters.statusCancelled")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priority || "all"}
              onValueChange={(value) => setPriority(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[110px] h-9 text-xs">
                <SelectValue placeholder={tList("filters.priorityPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tList("filters.priorityAll")}</SelectItem>
                <SelectItem value="low">{tList("filters.priorityLow")}</SelectItem>
                <SelectItem value="medium">{tList("filters.priorityMedium")}</SelectItem>
                <SelectItem value="high">{tList("filters.priorityHigh")}</SelectItem>
                <SelectItem value="urgent">{tList("filters.priorityUrgent")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={type || "all"}
              onValueChange={(value) => setType(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[120px] h-9 text-xs">
                <SelectValue placeholder={tList("filters.typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tList("filters.typeAll")}</SelectItem>
                <SelectItem value="general">{tList("filters.typeGeneral")}</SelectItem>
                <SelectItem value="call">{tList("filters.typeCall")}</SelectItem>
                <SelectItem value="email">{tList("filters.typeEmail")}</SelectItem>
                <SelectItem value="meeting">{tList("filters.typeMeeting")}</SelectItem>
                <SelectItem value="follow_up">{tList("filters.typeFollowUp")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={assignedTo || "all"}
              onValueChange={(value) => setAssignedTo(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue placeholder={tList("filters.assigneePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tList("filters.assigneeAll")}</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateRangePicker
              dateRange={currentRange}
              onDateChange={(range) => {
                if (range?.from) {
                  const fromDate = new Date(range.from);
                  fromDate.setHours(0, 0, 0, 0);
                  const fromStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}`;
                  setStartDueDate(fromStr);

                  if (range.to) {
                    const toDate = new Date(range.to);
                    toDate.setHours(0, 0, 0, 0);
                    const toStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
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

        <div className="flex items-center gap-2">
          {pagination && (
            <div className="hidden md:flex items-center text-xs text-muted-foreground mr-2">
              <Columns2 className="h-3.5 w-3.5 mr-1" />
              <span>
                {pagination.total} {tList("table.itemName")}
              </span>
            </div>
          )}
          <Button type="button" onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {tList("buttons.addTask")}
          </Button>
        </div>
      </div>

      {/* Kanban Board - full width grid */}
      <div className="relative">
        <div className="grid gap-3 pb-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {BOARD_STATUSES.map((boardStatus) => {
            const tasksForStatus = tasksByStatus[boardStatus];
            const columnTitleKey: Record<TaskStatus, string> = {
              pending: "columns.todo",
              in_progress: "columns.inProgress",
              completed: "columns.completed",
              cancelled: "columns.cancelled",
            };

            return (
              <div
                key={boardStatus}
                className="rounded-xl border bg-muted/40 backdrop-blur-sm p-2.5 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {tBoard(columnTitleKey[boardStatus])}
                    </span>
                  </div>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {tasksForStatus.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
                  {isLoading && tasks.length === 0 && (
                    <div className="space-y-2">
                      <div className="h-16 rounded-md bg-background/60 animate-pulse" />
                      <div className="h-16 rounded-md bg-background/60 animate-pulse" />
                    </div>
                  )}
                  {!isLoading && tasksForStatus.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {tBoard("emptyColumn")}
                    </p>
                  )}
                  {tasksForStatus.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClickTitle={() => handleViewTask(task.id)}
                      onEdit={() => setEditingTaskId(task.id)}
                      onDelete={() => handleDeleteClick(task.id)}
                      onComplete={() => handleComplete(task.id)}
                      onClickContact={task.contact ? handleViewContact : undefined}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tList("buttons.createTitle")}</DialogTitle>
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
              <DialogTitle>{tList("buttons.editTitle")}</DialogTitle>
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

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contactId={viewingContactId}
        open={isContactModalOpen}
        onOpenChange={(open) => {
          setIsContactModalOpen(open);
          if (!open) {
            setViewingContactId(null);
          }
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
        title={tList("deleteDialog.title")}
        description={tList("deleteDialog.description")}
        itemName={tList("table.itemName")}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}


