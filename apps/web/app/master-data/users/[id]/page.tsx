"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { UserDetail } from "@/features/master-data/user-management/components/user-detail";

function UserDetailPageContent({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <UserDetail userId={params.id} />
      </div>
    </DashboardLayout>
  );
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <UserDetailPageContent params={params} />
    </AuthGuard>
  );
}

