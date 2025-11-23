"use client";

import { use } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { UserForm } from "@/features/users/components/user-form";
import { useUser } from "@/features/users/hooks/useUsers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const { data, isLoading, error } = useUser(id);

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-8">
            <div className="text-center py-8">Loading user...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (error || !data?.data) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-8">
            <div className="text-center py-8 text-destructive">
              User not found
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  const user = data.data;

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
            <Link href={`/users/${id}/permissions`}>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Permissions
              </Button>
            </Link>
          </div>

          <UserForm user={user} mode="edit" />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

