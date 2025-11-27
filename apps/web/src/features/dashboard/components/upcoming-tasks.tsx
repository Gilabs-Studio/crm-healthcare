"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardOverview } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
  urgent: "destructive",
};

export function UpcomingTasks() {
  const t = useTranslations("dashboardOverview");
  const locale = useLocale();
  const { data, isLoading } = useDashboardOverview({ period: "month" });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("upcomingTasks.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const overview = data?.data;
  const tasks = overview?.upcoming_tasks ?? [];

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("upcomingTasks.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("upcomingTasks.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDueDate = (value?: string | null) => {
    if (!value) return t("upcomingTasks.noDueDate");
    const date = new Date(value);
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {t("upcomingTasks.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.slice(0, 4).map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{task.title}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDueDate(task.due_date)}</span>
              </div>
            </div>
            <Badge
              variant={priorityVariant[task.priority] ?? "outline"}
              className="text-xs capitalize"
            >
              {task.priority}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


