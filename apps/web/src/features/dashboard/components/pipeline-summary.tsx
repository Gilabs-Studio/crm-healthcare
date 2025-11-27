"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePipelineSummary } from "@/features/sales-crm/pipeline-management/hooks/usePipelines";
import type { StageSummary } from "@/features/sales-crm/pipeline-management/types";

function getStageColor(stageCode: string): string {
  // Samakan palet warna dengan Kanban board:
  // lihat `SeedPipelineStages` dan penggunaan `stage.color` di `kanban-board.tsx`
  switch (stageCode) {
    case "lead":
      // "#94A3B8" - Slate 400
      return "#94A3B8";
    case "qualification":
      // "#3B82F6" - Blue 500
      return "#3B82F6";
    case "proposal":
      // "#8B5CF6" - Violet 500
      return "#8B5CF6";
    case "negotiation":
      // "#F59E0B" - Amber 500
      return "#F59E0B";
    case "closed_won":
      // "#10B981" - Emerald 500
      return "#10B981";
    case "closed_lost":
      // "#EF4444" - Red 500
      return "#EF4444";
    default:
      // Fallback ke warna netral
      return "#CBD5F5";
  }
}

export function PipelineSummary() {
  const t = useTranslations("pipelineSummary");
  const { data, isLoading } = usePipelineSummary();
  const summary = data?.data;
  const totalDeals = summary?.total_deals ?? 0;

  const stagesWithPercentages: (StageSummary & { percentage: number })[] =
    summary?.by_stage && summary.by_stage.length > 0
      ? summary.by_stage.map((stage) => ({
          ...stage,
          percentage:
            totalDeals > 0
              ? Math.round((stage.deal_count / totalDeals) * 100)
              : 0,
        }))
      : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t("title")}</CardTitle>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </CardHeader>
      <CardContent>
        {isLoading && stagesWithPercentages.length === 0 ? (
          <>
            <Skeleton className="mb-4 h-6 w-40" />
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </>
        ) : null}

        {!isLoading && stagesWithPercentages.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t("noData", { default: "No pipeline data" })}
          </p>
        ) : null}

        {stagesWithPercentages.length > 0 && (
          <>
            {/* Top stacked bar */}
            <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-muted">
              {stagesWithPercentages.map((stage) => (
                <div
                  key={stage.stage_id}
                  style={{
                    width: `${stage.percentage || 0}%`,
                    backgroundColor: getStageColor(stage.stage_code),
                  }}
                />
              ))}
            </div>

            {/* Stage rows */}
            <div className="space-y-3">
              {stagesWithPercentages.map((stage) => (
                <div
                  key={stage.stage_id}
                  className="flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex flex-1 items-center gap-2">
                    <span
                      className="inline-flex h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: getStageColor(stage.stage_code),
                      }}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {stage.stage_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stage.deal_count.toLocaleString("id-ID")} deals ·{" "}
                        {stage.total_value_formatted}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-24 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${stage.percentage || 0}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {stage.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

