"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Edit2, Trash2, User } from "lucide-react";
import type { Task } from "../types";

interface TaskCardProps {
  readonly task: Task;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly onComplete?: () => void;
  readonly onClickTitle?: () => void;
}

const statusVariantMap: Record<Task["status"], "default" | "secondary" | "outline" | "destructive"> =
  {
    pending: "outline",
    in_progress: "secondary",
    completed: "default",
    cancelled: "destructive",
  };

const priorityVariantMap: Record<Task["priority"], "default" | "secondary" | "outline" | "destructive"> =
  {
    low: "outline",
    medium: "secondary",
    high: "default",
    urgent: "destructive",
  };

export function TaskCard({ task, onEdit, onDelete, onComplete, onClickTitle }: TaskCardProps) {
  const dueLabel =
    task.due_date &&
    new Date(task.due_date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="group relative flex items-start gap-4 rounded-lg border bg-card p-4 hover:border-border/80 hover:shadow-sm transition-all cursor-default">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <button
              type="button"
              onClick={onClickTitle}
              className="text-left font-medium text-sm text-foreground hover:text-primary hover:underline"
            >
              {task.title}
            </button>
            {task.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={statusVariantMap[task.status]} className="text-[11px] font-normal">
              {task.status.replace("_", " ")}
            </Badge>
            <Badge
              variant={priorityVariantMap[task.priority]}
              className="text-[11px] font-normal"
            >
              {task.priority}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {task.account && (
            <span className="truncate max-w-[180px]">
              Account: <span className="text-foreground font-medium">{task.account.name}</span>
            </span>
          )}
          {task.contact && (
            <span className="truncate max-w-[180px]">
              Contact: <span className="text-foreground font-medium">{task.contact.name}</span>
            </span>
          )}
          {task.assigned_user && (
            <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
              <User className="h-3 w-3" />
              <span>{task.assigned_user.name}</span>
            </span>
          )}
          {dueLabel && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Due {dueLabel}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        {onComplete && task.status !== "completed" && task.status !== "cancelled" && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={onComplete}
            title="Mark as completed"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="h-8 w-8"
          onClick={onEdit}
          title="Edit task"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}


