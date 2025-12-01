"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pipelineService } from "../services/pipelineService";
import type { CreateStageFormData, UpdateStageFormData, UpdateStagesOrderFormData } from "../schemas/pipeline.schema";

export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStageFormData) => pipelineService.createStage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStageFormData }) =>
      pipelineService.updateStage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pipelineService.deleteStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
    },
  });
}

export function useUpdateStagesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStagesOrderFormData) => pipelineService.updateStagesOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
    },
  });
}




