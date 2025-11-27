"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DealCard } from "./deal-card";
import type { Deal } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DealForm } from "./deal-form";
import { useKanbanBoard } from "../hooks/useKanbanBoard";
import { useTranslations } from "next-intl";

interface KanbanBoardProps {
  readonly onDealClick?: (deal: Deal) => void;
}

export function KanbanBoard({ onDealClick }: KanbanBoardProps) {
  const t = useTranslations("pipelineManagement.kanban");
  const {
    pipelines,
    dealsByStage,
    isLoading,
    isCreateDialogOpen,
    editingDeal,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleCreateDeal,
    handleUpdateDeal,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    isCreating,
    isUpdating,
  } = useKanbanBoard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-muted animate-pulse rounded w-64 mb-2" />
          <div className="h-4 bg-muted animate-pulse rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-4">
                <div className="h-12 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-32 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto" size="default">
          <Plus className="h-4 w-4 mr-2" />
          {t("newDeal")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pipelines.map((stage) => {
          const stageDeals = dealsByStage[stage.id] || [];
          
          return (
            <div
              key={stage.id}
              className="bg-card border border-border rounded-lg p-4 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center gap-2.5 mb-4 flex-shrink-0 pb-3 border-b border-border">
                <div
                  className="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-background"
                  style={{ 
                    backgroundColor: stage.color,
                    ringColor: stage.color + "40"
                  }}
                />
                <h3 className="font-semibold text-base truncate flex-1">{stage.name}</h3>
                <Badge variant="secondary" className="shrink-0 text-xs font-semibold">
                  {stageDeals.length}
                </Badge>
              </div>

              <div className="space-y-3 min-h-[200px] flex-1 overflow-y-auto pr-1">
                {stageDeals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("noDeals")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("noDealsHint")}
                    </p>
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <DealCard
                        deal={deal}
                        onClick={() => {
                          if (onDealClick) {
                            onDealClick(deal);
                          } else {
                            openEditDialog(deal);
                          }
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Deal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={closeCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("createDialogTitle")}</DialogTitle>
          </DialogHeader>
          <DealForm
            onSubmit={handleCreateDeal}
            onCancel={closeCreateDialog}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Deal Dialog */}
      {editingDeal && (
        <Dialog open={!!editingDeal} onOpenChange={closeEditDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("editDialogTitle")}</DialogTitle>
            </DialogHeader>
            <DealForm
              deal={editingDeal}
              onSubmit={handleUpdateDeal}
              onCancel={closeEditDialog}
              isLoading={isUpdating}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

