"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { VisitReportManagement } from "@/features/sales-crm/visit-report/components/visit-report-management";

function VisitReportsPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <VisitReportManagement />
      </div>
    </DashboardLayout>
  );
}

export default function VisitReportsPage() {
  return (
    <AuthGuard>
      <VisitReportsPageContent />
    </AuthGuard>
  );
}

