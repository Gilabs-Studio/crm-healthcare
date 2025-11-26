"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AccountManagement } from "@/features/sales-crm/account-management/components/account-management";

function AccountsPageContent() {
  return (
    <div className="container mx-auto py-6 px-4">
      <AccountManagement />
    </div>
  );
}

export default function AccountsPage() {
  return (
    <AuthGuard>
      <AccountsPageContent />
    </AuthGuard>
  );
}

