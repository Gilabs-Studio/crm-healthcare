"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { procedureService } from "../services/masterDataService";
import type { CreateProcedureFormData, UpdateProcedureFormData } from "../types";

export function useProcedures(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["procedures", params],
    queryFn: () => procedureService.list(params),
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

export function useProcedure(id: string) {
  return useQuery({
    queryKey: ["procedures", id],
    queryFn: () => procedureService.getById(id),
    enabled: !!id,
  });
}

export function useSearchProcedures(params: { query: string; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["procedures", "search", params],
    queryFn: () => procedureService.search(params),
    enabled: !!params.query && params.query.length > 0,
  });
}

export function useCreateProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProcedureFormData) => procedureService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
    },
  });
}

export function useUpdateProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProcedureFormData }) =>
      procedureService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      queryClient.invalidateQueries({ queryKey: ["procedures", variables.id] });
    },
  });
}

export function useDeleteProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => procedureService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
    },
  });
}

