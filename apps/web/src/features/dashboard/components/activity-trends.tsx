"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActivityTrends, useDashboardOverview } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";

const chartConfig = {
  visits: {
    label: "Visits",
    color: "oklch(0.5234 0.1347 144.1672)", // Primary - Hijau
  },
  calls: {
    label: "Calls",
    color: "oklch(0.55 0.15 240)", // Biru
  },
  emails: {
    label: "Emails",
    color: "oklch(0.65 0.15 60)", // Orange/Amber
  },
} satisfies ChartConfig;

export function ActivityTrends() {
  const t = useTranslations("activityTrends");
  const locale = useLocale();
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");
  const { data: overviewData } = useDashboardOverview({ period: "month" });
  
  // Map timeRange to period for API
  const period = React.useMemo(() => {
    switch (timeRange) {
      case "7d":
        return "week";
      case "30d":
        return "month";
      default:
        return "month"; // Default for 90d
    }
  }, [timeRange]);

  const { data: trendsData, isLoading } = useActivityTrends({ period });

  const overview = overviewData?.data;
  const trends = trendsData?.data;

  // Prepare chart data from API - must be called unconditionally (Rules of Hooks)
  const chartData = React.useMemo(() => {
    if (!trends?.by_date || trends.by_date.length === 0) {
      return [];
    }

    // Filter data based on time range
    const now = new Date();
    let daysToSubtract = 30;
    if (timeRange === "7d") {
      daysToSubtract = 7;
    } else if (timeRange === "90d") {
      daysToSubtract = 90;
    }
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return trends.by_date
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate;
      })
      .map((item) => ({
        date: item.date,
        visits: item.visits,
        calls: item.calls,
        emails: item.emails,
      }));
  }, [trends, timeRange]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!overview) {
    return null;
  }

  const activityStats = overview.activity_stats ?? {
    total: 0,
    visits: 0,
    calls: 0,
    emails: 0,
    change_percent: 0,
  };

  return (
    <Card>
      <CardHeader className="relative flex items-center gap-2 space-y-0 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle>{t("title")}</CardTitle>
          </div>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder={t("timeRange.30d")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{t("timeRange.7d")}</SelectItem>
            <SelectItem value="30d">{t("timeRange.30d")}</SelectItem>
            <SelectItem value="90d">{t("timeRange.90d")}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("totalVisits")}</div>
              <div className="text-2xl font-bold">{activityStats.visits}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("totalCalls")}</div>
              <div className="text-2xl font-bold">{activityStats.calls}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("totalEmails")}</div>
              <div className="text-2xl font-bold">{activityStats.emails}</div>
            </div>
          </div>

          {chartData.length > 0 && (
            <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-calls)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-calls)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillEmails" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-emails)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-emails)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const dateValue =
                          typeof value === "string" || typeof value === "number"
                            ? new Date(value)
                            : value instanceof Date
                              ? value
                              : new Date(String(value));
                        return dateValue.toLocaleDateString(locale, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="visits"
                  type="natural"
                  fill="url(#fillVisits)"
                  stroke="var(--color-visits)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="calls"
                  type="natural"
                  fill="url(#fillCalls)"
                  stroke="var(--color-calls)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="emails"
                  type="natural"
                  fill="url(#fillEmails)"
                  stroke="var(--color-emails)"
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

