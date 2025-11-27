"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { TaskManagement } from "@/features/sales-crm/task-management/components/task-management";

function TasksPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <TaskManagement />
      </div>
    </DashboardLayout>
  );
}

export default function TasksPage() {
  return (
    <AuthGuard>
      <TasksPageContent />
    </AuthGuard>
  );
}


