"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, BarChart3, TrendingUp, Settings, Plus } from "lucide-react";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { KanbanBoard } from "@/features/sales-crm/pipeline-management/components/kanban-board";
import { PipelineSummary } from "@/features/sales-crm/pipeline-management/components/pipeline-summary";
import { Forecast } from "@/features/sales-crm/pipeline-management/components/forecast";
import { StagesList } from "@/features/sales-crm/pipeline-management/components/stages-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DealForm } from "@/features/sales-crm/pipeline-management/components/deal-form";
import { DealDetailModal } from "@/features/sales-crm/pipeline-management/components/deal-detail-modal";
import { useCreateDeal } from "@/features/sales-crm/pipeline-management/hooks/useDeals";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

function PipelinePageContent() {
  // All hooks must be called in the same order on every render
  const t = useTranslations("pipelineManagement.page");
  const tKanban = useTranslations("pipelineManagement.kanban");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingDealId, setViewingDealId] = useState<string | null>(null);
  const { mutate: createDeal, isPending: isCreating } = useCreateDeal();
  const hasStagesPermission = useHasPermission("STAGES");

  const handleDealClick = (deal: { id: string }) => {
    setViewingDealId(deal.id);
  };

  const handleCreateDeal = async (data: unknown) => {
    await createDeal(data as any, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4"
    >
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("description")}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto" size="default">
            <Plus className="h-4 w-4 mr-2" />
            {tKanban("newDeal")}
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
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
      </motion.div>

      {/* Create Deal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tKanban("createDialogTitle")}</DialogTitle>
          </DialogHeader>
          <DealForm
            onSubmit={handleCreateDeal}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Deal Detail Modal */}
      <DealDetailModal
        dealId={viewingDealId}
        open={!!viewingDealId}
        onOpenChange={(open) => !open && setViewingDealId(null)}
      />
    </motion.div>
  );
}

export default function PipelinePage() {
  return (
    <AuthGuard>
      <PermissionGuard requiredPermission="VIEW_PIPELINE">
        <PipelinePageContent />
      </PermissionGuard>
    </AuthGuard>
  );
}



