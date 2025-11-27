"use client";

import { ClipboardList } from "lucide-react";
import { TaskList } from "./task-list";

export function TaskManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task & Reminder Management</h1>
        <p className="text-muted-foreground mt-2 flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Manage your tasks, follow-ups, and reminders across accounts and deals
        </p>
      </div>

      <TaskList />
    </div>
  );
}


