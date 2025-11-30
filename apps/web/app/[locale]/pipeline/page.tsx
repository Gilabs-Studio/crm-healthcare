"use client";

import { LayoutDashboard, BarChart3, TrendingUp, Settings } from "lucide-react";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { KanbanBoard } from "@/features/sales-crm/pipeline-management/components/kanban-board";
import { PipelineSummary } from "@/features/sales-crm/pipeline-management/components/pipeline-summary";
import { Forecast } from "@/features/sales-crm/pipeline-management/components/forecast";
import { StagesList } from "@/features/sales-crm/pipeline-management/components/stages-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";

function PipelinePageContent() {
  const router = useRouter();
  const t = useTranslations("pipelineManagement.page");
  const hasStagesPermission = useHasPermission("STAGES");

  const handleDealClick = (deal: { id: string }) => {
    router.push(`/deals/${deal.id}`);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>

        <Tabs defaultValue="kanban" className="w-full">
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              {t("tabKanban")}
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("tabSummary")}
            </TabsTrigger>
            <TabsTrigger value="forecast" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("tabForecast")}
            </TabsTrigger>
            {hasStagesPermission && (
              <TabsTrigger value="stages" className="gap-2">
                <Settings className="h-4 w-4" />
                {t("tabStages")}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard onDealClick={handleDealClick} />
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <PipelineSummary />
          </TabsContent>

          <TabsContent value="forecast" className="mt-6">
            <Forecast />
          </TabsContent>

          {hasStagesPermission && (
            <TabsContent value="stages" className="mt-6">
              <StagesList />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  return (
    <AuthGuard>
      <PipelinePageContent />
    </AuthGuard>
  );
}



