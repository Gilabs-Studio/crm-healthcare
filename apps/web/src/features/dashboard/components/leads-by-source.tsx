"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "../hooks/useDashboard";

const COLORS = [
  "oklch(0.65 0.15 60)", // orange
  "oklch(0.55 0.15 240)", // blue
  "oklch(0.55 0.15 300)", // purple
  "oklch(0.52 0.13 144)", // green
];

const chartConfig = {
  value: {
    label: "Leads",
    color: "oklch(0.52 0.13 144)",
  },
} satisfies ChartConfig;

export function LeadsBySource() {
  const t = useTranslations("dashboardOverview");
  const { data, isLoading } = useDashboardOverview({ period: "month" });

  const overview = data?.data;

  const chartData = useMemo(() => {
    if (!overview?.leads_by_source || overview.leads_by_source.by_source.length === 0) {
      return [];
    }

    return overview.leads_by_source.by_source.map((item) => ({
      name: item.source,
      value: item.count,
    }));
  }, [overview]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("leadsBySource.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!overview || !overview.leads_by_source) {
    return null;
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("leadsBySource.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("leadsBySource.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {t("leadsBySource.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-40 w-40"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={32}
              outerRadius={64}
              paddingAngle={4}
              strokeWidth={0}
            >
              {chartData.map((_, index) => (
                <Cell
                  // eslint-disable-next-line react/no-array-index-key
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="name" />}
            />
          </PieChart>
        </ChartContainer>

        <div className="space-y-2 text-sm flex-1">
          <div className="font-medium">
            {overview.leads_by_source.total.toLocaleString("id-ID")}{" "}
            {t("leadsBySource.totalLabel")}
          </div>
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="capitalize">
                  {t(`leadsBySource.source.${item.name}`, {
                    default: item.name,
                  })}
                </span>
              </div>
              <span className="text-muted-foreground">
                {item.value.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


