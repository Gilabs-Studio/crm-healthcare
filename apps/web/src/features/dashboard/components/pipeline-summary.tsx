"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePipelineSummary } from "@/features/dashboard/hooks/useDashboard";
import type { PipelineSummaryStage } from "@/features/dashboard/types";

export function PipelineSummary() {
  const t = useTranslations("pipelineSummary");
  const { data, isLoading } = usePipelineSummary();
  const summary = data?.data;

  // Use stages from API response (already includes all stages with colors, sorted by order from backend)
  const stages: PipelineSummaryStage[] = summary?.by_stage || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t("title")}</CardTitle>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </CardHeader>
      <CardContent>
        {isLoading && stages.length === 0 ? (
          <>
            <Skeleton className="mb-4 h-6 w-40" />
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={`pipeline-skeleton-${index}`} className="h-10 w-full" />
              ))}
            </div>
          </>
        ) : null}

        {!isLoading && stages.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {t("noData", { default: "No pipeline data" })}
          </p>
        ) : null}

        {stages.length > 0 && (
          <>
            {/* Top stacked bar */}
            <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-muted">
              {stages.map((stage) => (
                <div
                  key={stage.stage_id}
                  style={{
                    width: `${stage.percentage || 0}%`,
                    backgroundColor: stage.stage_color || "#CBD5F5",
                  }}
                />
              ))}
            </div>

            {/* Stage rows with max height and scroll */}
            <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2">
              {stages.map((stage) => (
                <div
                  key={stage.stage_id}
                  className="flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex flex-1 items-center gap-2">
                    <span
                      className="inline-flex h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: stage.stage_color || "#CBD5F5",
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
                  <div className="flex w-24 items-center gap-2 shrink-0">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${stage.percentage || 0}%`,
                          backgroundColor: stage.stage_color || "#CBD5F5",
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {Math.round(stage.percentage)}%
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

