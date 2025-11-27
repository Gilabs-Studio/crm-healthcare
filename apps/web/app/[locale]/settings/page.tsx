"use client";

import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { Settings } from "@/features/settings/components/settings";
import { Settings as SettingsIcon } from "lucide-react";

function SettingsPageContent() {
  const t = useTranslations("settings");

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>
        <Settings />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsPageContent />
    </AuthGuard>
  );
}


