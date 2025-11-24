"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { UserManagement } from "@/features/master-data/user-management/components/user-management";

function UsersPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <UserManagement />
      </div>
    </DashboardLayout>
  );
}

export default function UsersPage() {
  return (
    <AuthGuard>
      <UsersPageContent />
    </AuthGuard>
  );
}

