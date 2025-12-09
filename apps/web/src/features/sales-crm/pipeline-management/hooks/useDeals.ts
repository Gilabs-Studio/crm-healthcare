"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dealService } from "../services/dealService";
import type { CreateDealFormData, UpdateDealFormData, MoveDealFormData } from "../schemas/deal.schema";

export function useDeals(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  stage_id?: string;
  account_id?: string;
  assigned_to?: string;
  status?: "open" | "won" | "lost";
  source?: string;
}) {
  return useQuery({
    queryKey: ["deals", params],
    queryFn: () => dealService.list(params),
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

export function useDeal(id: string) {
  return useQuery({
    queryKey: ["deals", id],
    queryFn: () => dealService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDealFormData) => dealService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", "forecast"] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealFormData }) =>
      dealService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", "forecast"] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dealService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", "forecast"] });
    },
  });
}

export function useMoveDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveDealFormData }) =>
      dealService.move(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", "forecast"] });
    },
  });
}

export function useDealVisitReports(
  dealId: string,
  params?: {
    page?: number;
    per_page?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }
) {
  return useQuery({
    queryKey: ["deals", dealId, "visit-reports", params],
    queryFn: () => dealService.getVisitReports(dealId, params),
    enabled: !!dealId,
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

export function useDealActivities(
  dealId: string,
  params?: {
    page?: number;
    per_page?: number;
    type?: string;
    start_date?: string;
    end_date?: string;
  }
) {
  return useQuery({
    queryKey: ["deals", dealId, "activities", params],
    queryFn: () => dealService.getActivities(dealId, params),
    enabled: !!dealId,
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

