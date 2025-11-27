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
import { useVisitStatistics } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

const chartConfig = {
  total: {
    label: "Total Visits",
    color: "oklch(0.5234 0.1347 144.1672)", // Primary - Hijau
  },
  completed: {
    label: "Completed",
    color: "oklch(0.55 0.15 240)", // Biru
  },
  approved: {
    label: "Approved",
    color: "oklch(0.65 0.15 60)", // Orange/Amber
  },
  pending: {
    label: "Pending",
    color: "oklch(0.55 0.15 300)", // Purple
  },
} satisfies ChartConfig;

export function VisitStatistics() {
  const t = useTranslations("visitStatistics");
  const locale = useLocale();
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");
  const { data, isLoading } = useVisitStatistics({ period: "month" });

  const stats = data?.data;

  // Prepare chart data - must be called unconditionally (Rules of Hooks)
  const chartData = React.useMemo(() => {
    if (!stats?.by_date || stats.by_date.length === 0) {
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

    return stats.by_date
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate;
      })
      .map((item) => ({
        date: item.date,
        total: item.count,
        completed: item.completed,
        approved: item.approved,
        pending: item.pending,
      }));
  }, [stats, timeRange]);

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

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="relative flex items-center gap-2 space-y-0 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("total")}</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("completed")}</div>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("pending")}</div>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("approved")}</div>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </div>
          </div>

          {chartData.length > 0 && (
            <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-approved)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-approved)" stopOpacity={0.1} />
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
                        return new Date(value).toLocaleDateString(locale, {
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
                  dataKey="total"
                  type="natural"
                  fill="url(#fillTotal)"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="completed"
                  type="natural"
                  fill="url(#fillCompleted)"
                  stroke="var(--color-completed)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="approved"
                  type="natural"
                  fill="url(#fillApproved)"
                  stroke="var(--color-approved)"
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

