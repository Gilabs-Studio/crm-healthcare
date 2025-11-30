"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { VisitReportManagement } from "@/features/sales-crm/visit-report/components/visit-report-management";

function VisitReportsPageContent() {
  return (
    <div className="container mx-auto py-6 px-4">
      <VisitReportManagement />
    </div>
  );
}

export default function VisitReportsPage() {
  return (
    <AuthGuard>
      <PermissionGuard requiredPermission="VIEW_VISIT_REPORTS">
        <VisitReportsPageContent />
      </PermissionGuard>
    </AuthGuard>
  );
}


