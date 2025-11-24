"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AccountManagement } from "@/features/sales-crm/account-management/components/account-management";

function AccountsPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <AccountManagement />
      </div>
    </DashboardLayout>
  );
}

export default function AccountsPage() {
  return (
    <AuthGuard>
      <AccountsPageContent />
    </AuthGuard>
  );
}

