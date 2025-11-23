"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { DiagnosisList } from "@/features/master-data/components/diagnosis-list";

function DiagnosisPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Diagnosis Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage diagnosis codes (ICD-10) and information
            </p>
          </div>
          <DiagnosisList />
        </div>
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

