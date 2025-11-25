"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { visitReportService } from "../services/visitReportService";
import { activityService } from "../services/activityService";
import type {
  CreateVisitReportFormData,
  UpdateVisitReportFormData,
  CheckInFormData,
  CheckOutFormData,
  RejectFormData,
  UploadPhotoFormData,
} from "../schemas/visit-report.schema";

export function useVisitReports(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  account_id?: string;
  sales_rep_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ["visit-reports", params],
    queryFn: () => visitReportService.list(params),
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

export function useVisitReport(id: string) {
  return useQuery({
    queryKey: ["visit-reports", id],
    queryFn: () => visitReportService.getById(id),
    enabled: !!id,
  });
}

export function useCreateVisitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVisitReportFormData) => visitReportService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useUpdateVisitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVisitReportFormData }) =>
      visitReportService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["visit-reports", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useDeleteVisitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visitReportService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CheckInFormData }) =>
      visitReportService.checkIn(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["visit-reports", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CheckOutFormData }) =>
      visitReportService.checkOut(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["visit-reports", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useApproveVisitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visitReportService.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["visit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["visit-reports", id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useRejectVisitReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectFormData }) =>
      visitReportService.reject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["visit-reports", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UploadPhotoFormData }) =>
      visitReportService.uploadPhoto(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visit-reports"] });
      queryClient.invalidateQueries({ queryKey: ["visit-reports", variables.id] });
    },
  });
}

// Activity hooks
export function useActivities(params?: {
  page?: number;
  per_page?: number;
  type?: string;
  account_id?: string;
  contact_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () => activityService.list(params),
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

export function useActivityTimeline(params?: {
  account_id?: string;
  contact_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["activities", "timeline", params],
    queryFn: () => activityService.getTimeline(params),
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

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type: "visit" | "call" | "email" | "task" | "deal";
      account_id: string; // Required - activity must be linked to an account
      contact_id?: string;
      description: string;
      timestamp: string;
      metadata?: Record<string, unknown>;
    }) => activityService.create(data),
    onSuccess: (_, variables) => {
      // Invalidate activities queries
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["activities", "timeline"] });
      
      // If account_id is provided, invalidate timeline for that account
      if (variables.account_id) {
        queryClient.invalidateQueries({
          queryKey: ["activities", "timeline", { account_id: variables.account_id }],
        });
      }
    },
  });
}

