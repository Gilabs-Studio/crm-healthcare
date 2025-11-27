"use client";

import { LayoutDashboard, BarChart3, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { KanbanBoard } from "@/features/sales-crm/pipeline-management/components/kanban-board";
import { PipelineSummary } from "@/features/sales-crm/pipeline-management/components/pipeline-summary";
import { Forecast } from "@/features/sales-crm/pipeline-management/components/forecast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

function PipelinePageContent() {
  const router = useRouter();
  const t = useTranslations("pipelinePage");

  const handleDealClick = (deal: { id: string }) => {
    router.push(`/deals/${deal.id}`);
  };

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("description")}
        </p>
      </div>
      
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {t("tabs.kanban")}
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("tabs.summary")}
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("tabs.forecast")}
          </TabsTrigger>
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
      </Tabs>
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



