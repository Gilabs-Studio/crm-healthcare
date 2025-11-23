"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { UserForm } from "@/features/users/components/user-form";

export default function NewUserPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-8">
          <UserForm mode="create" />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

