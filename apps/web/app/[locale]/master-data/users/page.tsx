"use client";

import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { UserManagement } from "@/features/master-data/user-management/components/user-management";

function UsersPageContent() {
  const t = useTranslations("masterData.usersPage");

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>
        <UserManagement />
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AuthGuard>
      <PermissionGuard requiredPermission="VIEW_USERS">
        <UsersPageContent />
      </PermissionGuard>
    </AuthGuard>
  );
}



