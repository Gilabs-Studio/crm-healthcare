"use client";

import { ClipboardList } from "lucide-react";
import { TaskList } from "./task-list";
import { useTranslations } from "next-intl";

export function TaskManagement() {
  const t = useTranslations("taskManagement.page");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2 flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          {t("description")}
        </p>
      </div>

      <TaskList />
    </div>
  );
}


