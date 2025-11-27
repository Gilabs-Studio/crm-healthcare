"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePipelineSummary } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";

export function PipelineSummary() {
  const t = useTranslations("pipelineSummary");
  const { data, isLoading } = usePipelineSummary({ period: "month" });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pipeline = data?.data;

  if (!pipeline) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <CardTitle>{t("title")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <div className="text-sm text-muted-foreground">{t("totalDeals")}</div>
            <div className="text-2xl font-bold">{pipeline.total_deals}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t("totalValue")}</div>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(pipeline.total_value)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              {t("wonDeals")}
            </div>
            <div className="text-2xl font-bold text-green-600">{pipeline.won_deals}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-600" />
              {t("lostDeals")}
            </div>
            <div className="text-2xl font-bold text-red-600">{pipeline.lost_deals}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("openDeals")}
            </div>
            <div className="text-2xl font-bold">{pipeline.open_deals}</div>
          </div>
        </div>

        {pipeline.by_stage && Object.keys(pipeline.by_stage).length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-medium mb-3">{t("byStage")}</div>
            <div className="space-y-2">
              {Object.entries(pipeline.by_stage).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground capitalize">
                    {stage.replace(/_/g, " ")}
                  </div>
                  <div className="text-sm font-medium">
                    {count} {t("dealsSuffix")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

