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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, TrendingUp, DollarSign, Target, AlertCircle } from "lucide-react";
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
  // Prepare chart data from by_stage
  const stageChartData = React.useMemo(() => {
    if (!data.by_stage || Object.keys(data.by_stage).length === 0) {
      return [];
    }

    return Object.entries(data.by_stage).map(([stage, count]) => ({
      stage: stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      deals: count,
      value: 0, // Placeholder - will be calculated when deal details are available
    }));
  }, [data.by_stage]);

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
      {/* Reminder Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p className="text-sm">
            <strong>Note:</strong> Some insights are calculated from available data. Additional metrics will be available
            after Sales Pipeline Management module is implemented (Sprint 2 - Dev2):
          </p>
          <ul className="text-sm mt-2 list-disc list-inside space-y-1">
            <li>
              <strong>Deal value by stage:</strong> Will show actual deal values per stage
            </li>
            <li>
              <strong>Conversion rates:</strong> Stage-to-stage conversion percentages
            </li>
            <li>
              <strong>Time in stage:</strong> Average time deals spend in each stage
            </li>
            <li>
              <strong>Forecast accuracy:</strong> Comparison of expected vs actual close dates
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.won_deals} won / {data.summary.total_deals} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Deal Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDealValue)}</div>
            <p className="text-xs text-muted-foreground">Per deal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.total_value)}</div>
            <p className="text-xs text-muted-foreground">All stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Deals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.summary.lost_deals}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Deals by Stage Chart */}
      {stageChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deals by Stage</CardTitle>
            <CardDescription>Distribution of deals across pipeline stages</CardDescription>
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
            <CardTitle>Stage Breakdown</CardTitle>
            <CardDescription>Detailed view of deals in each stage</CardDescription>
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
                          {count} deals ({percentage}%)
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
            <p className="text-sm">No stage data available. Stage breakdown will be available after Sales Pipeline module is implemented.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

