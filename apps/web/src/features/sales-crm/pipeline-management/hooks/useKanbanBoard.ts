"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { usePipelines } from "./usePipelines";
import { useDeals, useMoveDeal, useCreateDeal, useUpdateDeal } from "./useDeals";
import type { Deal, PipelineStage } from "../types";
import type { CreateDealFormData, UpdateDealFormData } from "../schemas/deal.schema";

export function useKanbanBoard() {
  const t = useTranslations("pipelineManagement.kanban");
  const { data: pipelinesData, isLoading: isLoadingPipelines } = usePipelines({ is_active: true });
  const { data: dealsData, isLoading: isLoadingDeals } = useDeals({ per_page: 100 });
  const moveDeal = useMoveDeal();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();

  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const pipelines = pipelinesData?.data || [];
  const deals = dealsData?.data || [];

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<string, Deal[]> = {};
    pipelines.forEach((stage) => {
      grouped[stage.id] = deals.filter((deal) => deal.stage_id === stage.id);
    });
    return grouped;
  }, [deals, pipelines]);

  // Sort pipelines by order
  const sortedPipelines = useMemo(() => {
    return [...pipelines].sort((a, b) => a.order - b.order);
  }, [pipelines]);

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.stage_id === targetStage.id) {
      setDraggedDeal(null);
      return;
    }

    try {
      await moveDeal.mutateAsync({
        id: draggedDeal.id,
        data: { stage_id: targetStage.id },
      });
      toast.success(
        t("toastDealMoved", {
          stage: targetStage.name,
        }),
      );
    } catch (error) {
      // Error already handled in api-client interceptor
    } finally {
      setDraggedDeal(null);
    }
  };

  const handleCreateDeal = async (data: CreateDealFormData) => {
    try {
      await createDeal.mutateAsync(data);
      setIsCreateDialogOpen(false);
      toast.success(t("toastDealCreated"));
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const handleUpdateDeal = async (data: UpdateDealFormData) => {
    if (editingDeal) {
      try {
        await updateDeal.mutateAsync({ id: editingDeal.id, data });
        setEditingDeal(null);
        toast.success(t("toastDealUpdated"));
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  const openCreateDialog = () => setIsCreateDialogOpen(true);
  const closeCreateDialog = () => setIsCreateDialogOpen(false);
  const openEditDialog = (deal: Deal) => setEditingDeal(deal);
  const closeEditDialog = () => setEditingDeal(null);

  return {
    // Data
    pipelines: sortedPipelines,
    dealsByStage,
    isLoading: isLoadingPipelines || isLoadingDeals,
    
    // State
    isCreateDialogOpen,
    editingDeal,
    
    // Actions
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleCreateDeal,
    handleUpdateDeal,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    
    // Mutations
    isCreating: createDeal.isPending,
    isUpdating: updateDeal.isPending,
  };
}

