"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { TaskManagement } from "@/features/sales-crm/task-management/components/task-management";

function TasksPageContent() {
  return (
      <div className="container mx-auto py-6 px-4">
        <TaskManagement />
      </div>
  );
}

export default function TasksPage() {
  return (
    <AuthGuard>
      <PermissionGuard requiredPermission="VIEW_TASKS">
        <TasksPageContent />
      </PermissionGuard>
    </AuthGuard>
  );
}


