"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useTask, useUpdateTask, useDeleteTask, useCompleteTask } from "@/features/sales-crm/task-management/hooks/useTasks";
import { TaskForm } from "@/features/sales-crm/task-management/components/task-form";
import { ReminderSettings } from "@/features/sales-crm/task-management/components/reminder-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";

function TaskDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const t = useTranslations("tasks.detail");
  const tCommon = useTranslations("common");

  const { data, isLoading } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const task = data?.data;

  const handleUpdate = async (formData: Parameters<typeof updateTask.mutateAsync>[0]["data"]) => {
    try {
      await updateTask.mutateAsync({ id: taskId, data: formData });
      setIsEditDialogOpen(false);
      toast.success(t("toast.updated"));
    } catch {
      // Error already handled in api-client interceptor
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(taskId);
      setIsDeleteDialogOpen(false);
      toast.success(t("toast.deleted"));
      router.push("/tasks");
    } catch {
      // Error already handled
    }
  };

  const handleCompleteTask = async () => {
    try {
      await completeTask.mutateAsync(taskId);
      toast.success(t("toast.completed"));
    } catch {
      // Error already handled
    }
  };

  if (isLoading) {
    return (
        <div className="container mx-auto py-6 px-4">
          <div className="text-center py-12 text-muted-foreground">
            {t("loading")}
          </div>
        </div>
    );
  }

  if (!task) {
    return (
        <div className="container mx-auto py-6 px-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("notFound")}</p>
            <Button type="button" onClick={() => router.push("/tasks")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToList")}
            </Button>
          </div>
        </div>
    );
  }

  const dueLabel =
    task.due_date &&
    new Date(task.due_date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => router.push("/tasks")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
            <div className="flex items-center gap-2">
              {task.status !== "completed" && task.status !== "cancelled" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCompleteTask}
                  disabled={completeTask.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {completeTask.isPending
                    ? t("actions.markCompletedLoading")
                    : t("actions.markCompleted")}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                {tCommon("edit")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {tCommon("delete")}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{task.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {task.type.replace("_", " ")}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {task.status.replace("_", " ")}
                    </Badge>
                    {dueLabel && (
                      <span className="text-xs text-muted-foreground">Due {dueLabel}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {task.description && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm">
                    {t("sections.description")}
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.account && (
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">
                      {t("sections.account")}
                    </h3>
                    <p className="text-sm text-muted-foreground">{task.account.name}</p>
                  </div>
                )}

                {task.contact && (
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">
                      {t("sections.contact")}
                    </h3>
                    <p className="text-sm text-muted-foreground">{task.contact.name}</p>
                  </div>
                )}

                {task.assigned_user && (
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">
                      {t("sections.assignedTo")}
                    </h3>
                    <p className="text-sm text-muted-foreground">{task.assigned_user.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {t("sections.createdAt")}{" "}
                  {new Date(task.created_at).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("sections.updatedAt")}{" "}
                  {new Date(task.updated_at).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="pt-4 border-t">
                <ReminderSettings taskId={taskId} />
              </div>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{tCommon("edit")}</DialogTitle>
              </DialogHeader>
              <TaskForm
                task={task}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditDialogOpen(false)}
                isLoading={updateTask.isPending}
              />
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("deleteDialog.description")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  {t("deleteDialog.cancel")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                >
                  {deleteTask.isPending
                    ? t("deleteDialog.confirmLoading")
                    : t("deleteDialog.confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
  );
}

export default function TaskDetailPage() {
  return (
    <AuthGuard>
      <TaskDetailPageContent />
    </AuthGuard>
  );
}


