"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { UserList } from "@/features/users/components/user-list";

export default function UsersPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-8">
          <UserList />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

