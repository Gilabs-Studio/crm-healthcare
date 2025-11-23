"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { DiagnosisManagement } from "@/features/master-data/components/diagnosis-management";

function DiagnosisPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <DiagnosisManagement />
      </div>
    </DashboardLayout>
  );
}

export default function DiagnosisPage() {
  return (
    <AuthGuard>
      <DiagnosisPageContent />
    </AuthGuard>
  );
}

