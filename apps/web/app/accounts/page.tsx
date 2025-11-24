"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AccountList } from "@/features/sales-crm/account-management/components/account-list";

function AccountsPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account & Contact Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage accounts (Hospitals, Clinics, Pharmacies) and their contacts
            </p>
          </div>
          <AccountList />
        </div>
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

