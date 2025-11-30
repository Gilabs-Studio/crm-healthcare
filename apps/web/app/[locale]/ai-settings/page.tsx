"use client";

import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { AISettings } from "@/features/ai/components/ai-settings";

function AISettingsPageContent() {
  const t = useTranslations("aiSettings");

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
        <AISettings />
      </div>
    </div>
  );
}

export default function AISettingsPage() {
  return (
    <AuthGuard>
      <PermissionGuard requiredPermission="VIEW_AI_SETTINGS">
        <AISettingsPageContent />
      </PermissionGuard>
    </AuthGuard>
  );
}

