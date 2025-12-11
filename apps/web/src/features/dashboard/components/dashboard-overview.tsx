"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardOverview } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Users, Briefcase, DollarSign, TrendingUp } from "lucide-react";

export function DashboardOverview() {
  const t = useTranslations("dashboardOverview");
  const { data, isLoading } = useDashboardOverview({ period: "month" });

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

  const targetProgress = overview.target?.progress_percent ?? 0;
  const accountStats = overview.account_stats ?? { total: 0, active: 0, inactive: 0, change_percent: 0 };
  const deals = overview.deals ?? { 
    total_deals: 0, 
    open_deals: 0, 
    won_deals: 0, 
    lost_deals: 0, 
    total_value: 0, 
    total_value_formatted: "Rp 0", 
    change_percent: 0 
  };
  const revenue = overview.revenue ?? { 
    total_revenue: 0, 
    total_revenue_formatted: "Rp 0", 
    change_percent: 0 
  };
  const leadStats = overview.lead_stats ?? {
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
    change_percent: 0,
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {/* Target progress */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("targetProgress.title")}
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(targetProgress)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("targetProgress.description", {
              progress: Math.round(targetProgress),
            })}
          </p>
        </CardContent>
      </Card>

      {/* Total customers/accounts */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("totalAccounts.title")}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {accountStats.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("totalAccounts.description", {
              active: accountStats.active,
              inactive: accountStats.inactive,
            })}
          </p>
        </CardContent>
      </Card>

      {/* Total deals */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("totalDeals.title")}
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {deals.total_deals}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("totalDeals.description", {
              open: deals.open_deals,
              won: deals.won_deals,
            })}
          </p>
        </CardContent>
      </Card>

      {/* Total revenue */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("totalRevenue.title")}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(revenue.total_revenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("totalRevenue.description")}
          </p>
        </CardContent>
      </Card>

      {/* Total leads */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("totalLeads.title")}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {leadStats.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("totalLeads.description", {
              qualified: leadStats.qualified,
              converted: leadStats.converted,
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

