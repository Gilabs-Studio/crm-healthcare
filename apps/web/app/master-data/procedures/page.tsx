"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { ProcedureList } from "@/features/master-data/components/procedure-list";

function ProcedurePageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Procedure Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage medical procedures and their information
            </p>
          </div>
          <ProcedureList />
        </div>
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

