"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardOverview } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverview() {
  const t = useTranslations("dashboardOverview");
  const { data, isLoading } = useDashboardOverview({ period: "today" });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <Card key={`dashboard-overview-skeleton-${key}`}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const overview = data?.data;

  if (!overview) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("totalVisits.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.visit_stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("totalVisits.description", {
              completed: overview.visit_stats.completed,
              pending: overview.visit_stats.pending,
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("totalAccounts.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.account_stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("totalAccounts.description", {
              active: overview.account_stats.active,
              inactive: overview.account_stats.inactive,
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("totalActivities.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.activity_stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("totalActivities.description", {
              visits: overview.activity_stats.visits,
              calls: overview.activity_stats.calls,
              emails: overview.activity_stats.emails,
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("approvedVisits.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.visit_stats.approved}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("approvedVisits.description", {
              rejected: overview.visit_stats.rejected,
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

