"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { Settings } from "@/features/settings/components/settings";

function SettingsPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <Settings />
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsPageContent />
    </AuthGuard>
  );
}


