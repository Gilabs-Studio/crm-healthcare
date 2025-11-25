"use client";

import { useQuery } from "@tanstack/react-query";
import { pipelineService } from "../services/pipelineService";

export function usePipelines(params?: { is_active?: boolean }) {
  return useQuery({
    queryKey: ["pipelines", params],
    queryFn: () => pipelineService.listStages(params),
    retry: (failureCount, error) => {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 1;
    },
  });
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: ["pipelines", id],
    queryFn: () => pipelineService.getStageById(id),
    enabled: !!id,
  });
}

export function usePipelineSummary() {
  return useQuery({
    queryKey: ["pipelines", "summary"],
    queryFn: () => pipelineService.getSummary(),
  });
}

export function useForecast(params?: {
  period?: "month" | "quarter" | "year";
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ["pipelines", "forecast", params],
    queryFn: () => pipelineService.getForecast(params),
  });
}

