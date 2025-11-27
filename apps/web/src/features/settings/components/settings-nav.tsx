"use client";

import { Bell, Workflow, Building2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GeneralSettingsForm } from "./general-settings-form";
import { NotificationSettingsForm } from "./notification-settings-form";
import { PipelineSettingsForm } from "./pipeline-settings-form";
import { useTranslations } from "next-intl";

export function SettingsNav() {
  const t = useTranslations("settings.nav.tabs");

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general" className="gap-2">
          <Building2 className="h-4 w-4" />
          {t("general")}
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="h-4 w-4" />
          {t("notifications")}
        </TabsTrigger>
        <TabsTrigger value="pipeline" className="gap-2">
          <Workflow className="h-4 w-4" />
          {t("pipeline")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <GeneralSettingsForm />
      </TabsContent>

      <TabsContent value="notifications" className="mt-6">
        <NotificationSettingsForm />
      </TabsContent>

      <TabsContent value="pipeline" className="mt-6">
        <PipelineSettingsForm />
      </TabsContent>
    </Tabs>
  );
}


