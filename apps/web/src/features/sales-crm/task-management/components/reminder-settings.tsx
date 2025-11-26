"use client";

import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import type { Reminder } from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createReminderSchema,
  updateReminderSchema,
  type CreateReminderFormData,
  type UpdateReminderFormData,
} from "../schemas/reminder.schema";
import { useTaskReminders } from "../hooks/useTaskList";

interface ReminderSettingsProps {
  readonly taskId: string;
}

export function ReminderSettings({ taskId }: ReminderSettingsProps) {
  const {
    reminders,
    isLoading,
    handleCreateReminder,
    handleUpdateReminder,
    handleDeleteReminder,
  } = useTaskReminders(taskId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deletingReminderId, setDeletingReminderId] = useState<string | null>(null);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Reminders</h3>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="text-xs">Add Reminder</span>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p className="text-xs text-muted-foreground">No reminders yet.</p>
      ) : (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-start justify-between rounded-md border bg-muted/40 px-3 py-2 text-xs"
            >
              <div>
                <p className="font-medium">
                  {formatDateTime(reminder.remind_at)}{" "}
                  <span className="text-muted-foreground">({reminder.reminder_type})</span>
                </p>
                {reminder.message && (
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                    {reminder.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setEditingReminder(reminder)}
                  title="Edit reminder"
                >
                  <Clock className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeletingReminderId(reminder.id)}
                  title="Delete reminder"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Reminder Dialog */}
      <ReminderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        taskId={taskId}
        mode="create"
        onCreate={handleCreateReminder}
      />

      {/* Edit Reminder Dialog */}
      {editingReminder && (
        <ReminderDialog
          open={!!editingReminder}
          onOpenChange={(open) => {
            if (!open) {
              setEditingReminder(null);
            }
          }}
          taskId={taskId}
          mode="edit"
          reminder={editingReminder}
          onUpdate={async (data) => {
            await handleUpdateReminder(editingReminder.id, data);
            setEditingReminder(null);
          }}
        />
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingReminderId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingReminderId(null);
          }
        }}
        onConfirm={async () => {
          if (!deletingReminderId) return;
          await handleDeleteReminder(deletingReminderId);
          setDeletingReminderId(null);
        }}
        title="Delete Reminder?"
        description="Are you sure you want to delete this reminder? This action cannot be undone."
        itemName="reminder"
        isLoading={false}
      />
    </div>
  );
}

interface ReminderDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly taskId: string;
  readonly mode: "create" | "edit";
  readonly reminder?: Reminder;
  readonly onCreate?: (data: CreateReminderFormData) => Promise<void>;
  readonly onUpdate?: (data: UpdateReminderFormData) => Promise<void>;
}

function ReminderDialog({
  open,
  onOpenChange,
  taskId,
  mode,
  reminder,
  onCreate,
  onUpdate,
}: ReminderDialogProps) {
  const isEdit = mode === "edit" && !!reminder;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateReminderFormData | UpdateReminderFormData>({
    resolver: zodResolver(isEdit ? updateReminderSchema : createReminderSchema),
    defaultValues: isEdit
      ? {
          task_id: reminder?.task_id ?? taskId,
          reminder_type: reminder?.reminder_type,
          message: reminder?.message,
          remind_at: reminder?.remind_at
            ? new Date(reminder.remind_at).toISOString().slice(0, 16)
            : "",
        }
      : {
          task_id: taskId,
          reminder_type: "in_app",
        },
  });

  const onSubmit = async (data: CreateReminderFormData | UpdateReminderFormData) => {
    if (isEdit) {
      if (!onUpdate) return;
      const submitData: UpdateReminderFormData = {};

      if ("remind_at" in data && data.remind_at) {
        const date = new Date(data.remind_at);
        if (!Number.isNaN(date.getTime())) {
          submitData.remind_at = date.toISOString();
        }
      }

      if ("reminder_type" in data && data.reminder_type) {
        submitData.reminder_type = data.reminder_type;
      }

      if ("message" in data && data.message !== undefined) {
        submitData.message = data.message;
      }

      await onUpdate(submitData);
    } else {
      if (!onCreate) return;
      const submitData: CreateReminderFormData = {
        task_id: taskId,
        reminder_type: "in_app",
        remind_at: "",
      };

      if ("remind_at" in data && data.remind_at) {
        const date = new Date(data.remind_at);
        if (!Number.isNaN(date.getTime())) {
          submitData.remind_at = date.toISOString();
        }
      }

      if ("reminder_type" in data && data.reminder_type) {
        submitData.reminder_type = data.reminder_type;
      }

      if ("message" in data && data.message) {
        submitData.message = data.message;
      }

      await onCreate(submitData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Reminder" : "Add Reminder"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && (
            <input type="hidden" {...register("task_id" as "task_id")} value={taskId} />
          )}

          <Field orientation="vertical">
            <FieldLabel>Remind At *</FieldLabel>
            <Input
              type="datetime-local"
              {...register("remind_at" as "remind_at")}
              value={(watch("remind_at") as string | undefined) ?? ""}
              onChange={(event) => setValue("remind_at" as "remind_at", event.target.value)}
            />
            {errors.remind_at && <FieldError>{errors.remind_at.message}</FieldError>}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Channel</FieldLabel>
            <Select
              value={(watch("reminder_type") as string | undefined) ?? "in_app"}
              onValueChange={(value) =>
                setValue("reminder_type" as "reminder_type", value as "in_app" | "email" | "sms")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_app">In App</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            {errors.reminder_type && <FieldError>{errors.reminder_type.message}</FieldError>}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Message</FieldLabel>
            <Textarea
              {...register("message" as "message")}
              placeholder="Optional reminder message"
              rows={3}
            />
            {errors.message && <FieldError>{errors.message.message}</FieldError>}
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


