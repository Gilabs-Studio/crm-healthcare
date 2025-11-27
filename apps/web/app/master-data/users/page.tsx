"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { UserManagement } from "@/features/master-data/user-management/components/user-management";

function UsersPageContent() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, and permissions in one place
          </p>
        </div>
        <UserManagement />
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AuthGuard>
      <UsersPageContent />
    </AuthGuard>
  );
}

