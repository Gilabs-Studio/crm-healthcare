"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diagnosisService } from "../services/masterDataService";
import type { CreateDiagnosisFormData, UpdateDiagnosisFormData } from "../types";

export function useDiagnoses(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["diagnoses", params],
    queryFn: () => diagnosisService.list(params),
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

export function useDiagnosis(id: string) {
  return useQuery({
    queryKey: ["diagnoses", id],
    queryFn: () => diagnosisService.getById(id),
    enabled: !!id,
  });
}

export function useSearchDiagnoses(params: { query: string; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["diagnoses", "search", params],
    queryFn: () => diagnosisService.search(params),
    enabled: !!params.query && params.query.length > 0,
  });
}

export function useCreateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiagnosisFormData) => diagnosisService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnoses"] });
    },
  });
}

export function useUpdateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiagnosisFormData }) =>
      diagnosisService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diagnoses"] });
      queryClient.invalidateQueries({ queryKey: ["diagnoses", variables.id] });
    },
  });
}

export function useDeleteDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => diagnosisService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnoses"] });
    },
  });
}

