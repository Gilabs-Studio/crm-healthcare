"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { ProcedureManagement } from "@/features/master-data/components/procedure-management";

function ProcedurePageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <ProcedureManagement />
      </div>
    </DashboardLayout>
  );
}

export default function ProcedurePage() {
  return (
    <AuthGuard>
      <ProcedurePageContent />
    </AuthGuard>
  );
}

