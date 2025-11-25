"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import type { DashboardRequestParams } from "../types";

export function useDashboardOverview(params?: DashboardRequestParams) {
  return useQuery({
    queryKey: ["dashboard", "overview", params],
    queryFn: () => dashboardService.getOverview(params),
  });
}

export function useVisitStatistics(params?: DashboardRequestParams) {
  return useQuery({
    queryKey: ["dashboard", "visits", params],
    queryFn: () => dashboardService.getVisitStatistics(params),
  });
}

export function usePipelineSummary(params?: DashboardRequestParams) {
  return useQuery({
    queryKey: ["dashboard", "pipeline", params],
    queryFn: () => dashboardService.getPipelineSummary(params),
  });
}

export function useTopAccounts(params?: DashboardRequestParams) {
  return useQuery({
    queryKey: ["dashboard", "top-accounts", params],
    queryFn: () => dashboardService.getTopAccounts(params),
  });
}

export function useTopSalesRep(params?: DashboardRequestParams) {
  return useQuery({
    queryKey: ["dashboard", "top-sales-rep", params],
    queryFn: () => dashboardService.getTopSalesRep(params),
  });
}

export function useRecentActivities(params?: DashboardRequestParams) {
  return useQuery({
    queryKey: ["dashboard", "recent-activities", params],
    queryFn: () => dashboardService.getRecentActivities(params),
  });
}

export function useActivityTrends(params?: DashboardRequestParams) {
  return useQuery({
    queryKey: ["dashboard", "activity-trends", params],
    queryFn: () => dashboardService.getActivityTrends(params),
  });
}

