"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
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
      toast.success("Task updated successfully");
    } catch {
      // Error already handled in api-client interceptor
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(taskId);
      setIsDeleteDialogOpen(false);
      toast.success("Task deleted successfully");
      router.push("/tasks");
    } catch {
      // Error already handled
    }
  };

  const handleCompleteTask = async () => {
    try {
      await completeTask.mutateAsync(taskId);
      toast.success("Task marked as completed");
    } catch {
      // Error already handled
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="text-center py-12 text-muted-foreground">Loading task...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Task not found</p>
            <Button type="button" onClick={() => router.push("/tasks")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </div>
        </div>
      </DashboardLayout>
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
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => router.push("/tasks")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
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
                  {completeTask.isPending ? "Completing..." : "Mark as Completed"}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
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
                  <h3 className="font-semibold mb-2 text-sm">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.account && (
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Account</h3>
                    <p className="text-sm text-muted-foreground">{task.account.name}</p>
                  </div>
                )}

                {task.contact && (
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Contact</h3>
                    <p className="text-sm text-muted-foreground">{task.contact.name}</p>
                  </div>
                )}

                {task.assigned_user && (
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Assigned To</h3>
                    <p className="text-sm text-muted-foreground">{task.assigned_user.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Created at: {new Date(task.created_at).toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(task.updated_at).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="pt-4 border-t">
                <ReminderSettings taskId={taskId} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
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
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
              >
                {deleteTask.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function TaskDetailPage() {
  return (
    <AuthGuard>
      <TaskDetailPageContent />
    </AuthGuard>
  );
}


