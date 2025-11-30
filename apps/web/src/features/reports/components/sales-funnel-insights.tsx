"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp, DollarSign, Target, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PipelineReport } from "../types";

interface SalesFunnelInsightsProps {
  data: PipelineReport;
}

const chartConfig = {
  deals: {
    label: "Deals",
    color: "oklch(0.5234 0.1347 144.1672)", // Primary - Hijau
  },
  value: {
    label: "Value",
    color: "oklch(0.55 0.15 240)", // Biru
  },
} satisfies ChartConfig;

export function SalesFunnelInsights({ data }: SalesFunnelInsightsProps) {
  const t = useTranslations("reportsFeature.salesFunnelInsights");

  // Prepare chart data from by_stage and deals
  const stageChartData = React.useMemo(() => {
    if (!data.by_stage || Object.keys(data.by_stage).length === 0) {
      return [];
    }

    // Calculate value per stage from deals
    const stageValues: Record<string, number> = {};
    if (data.deals) {
      data.deals.forEach((deal) => {
        const stageKey = deal.stage_code || deal.stage;
        if (stageKey) {
          stageValues[stageKey] = (stageValues[stageKey] || 0) + deal.value;
        }
      });
    }

    return Object.entries(data.by_stage).map(([stage, count]) => ({
      stage: stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      deals: count,
      value: stageValues[stage] || 0,
    }));
  }, [data.by_stage, data.deals]);

  // Calculate metrics
  const winRate = data.summary.total_deals > 0
    ? ((data.summary.won_deals / data.summary.total_deals) * 100).toFixed(1)
    : "0.0";

  const averageDealValue = data.summary.total_deals > 0
    ? data.summary.total_value / data.summary.total_deals
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("metricWinRate")}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <p className="text-xs text-muted-foreground">
              {t("metricWinRateDetail", {
                won: data.summary.won_deals,
                total: data.summary.total_deals,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("metricAvgDealValue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDealValue)}</div>
            <p className="text-xs text-muted-foreground">
              {t("metricAvgDealValueDetail")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("metricTotalPipelineValue")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.total_value)}</div>
            <p className="text-xs text-muted-foreground">
              {t("metricTotalPipelineValueDetail")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("metricLostDeals")}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.summary.lost_deals}</div>
            <p className="text-xs text-muted-foreground">
              {t("metricLostDealsDetail")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Won Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.won_value || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total value of won deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expected Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.expected_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total expected revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Deals
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.open_deals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently open opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.open_value || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total value of open deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deals by Stage Chart */}
      {stageChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("chartDealsByStageTitle")}</CardTitle>
            <CardDescription>
              {t("chartDealsByStageDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
              <BarChart data={stageChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.toString()}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="deals" fill="var(--color-deals)" radius={[4, 4, 0, 0]} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Stage Breakdown */}
      {data.by_stage && Object.keys(data.by_stage).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("stageBreakdownTitle")}</CardTitle>
            <CardDescription>
              {t("stageBreakdownDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.by_stage)
                .sort(([, a], [, b]) => b - a)
                .map(([stage, count]) => {
                  const percentage = data.summary.total_deals > 0
                    ? ((count / data.summary.total_deals) * 100).toFixed(1)
                    : "0.0";

                  return (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {stage.replace(/_/g, " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {t("stageBreakdownItem", { count, percentage })}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!data.by_stage || Object.keys(data.by_stage).length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-sm">
              {t("emptyStageTitle")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

