"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { UserList } from "@/features/user/components/user-list";

function UsersPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <UserList />
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

