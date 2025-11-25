import apiClient from "@/lib/api-client";
import type {
  DashboardOverviewResponse,
  VisitStatisticsResponse,
  ActivityTrendsResponse,
  PipelineSummaryResponse,
  TopAccountsResponse,
  TopSalesRepResponse,
  RecentActivitiesResponse,
  DashboardRequestParams,
} from "../types";

export const dashboardService = {
  async getOverview(params?: DashboardRequestParams): Promise<DashboardOverviewResponse> {
    const response = await apiClient.get<DashboardOverviewResponse>("/dashboard/overview", {
      params,
    });
    return response.data;
  },

  async getVisitStatistics(params?: DashboardRequestParams): Promise<VisitStatisticsResponse> {
    const response = await apiClient.get<VisitStatisticsResponse>("/dashboard/visits", {
      params,
    });
    return response.data;
  },

  async getPipelineSummary(params?: DashboardRequestParams): Promise<PipelineSummaryResponse> {
    const response = await apiClient.get<PipelineSummaryResponse>("/dashboard/pipeline", {
      params,
    });
    return response.data;
  },

  async getTopAccounts(params?: DashboardRequestParams): Promise<TopAccountsResponse> {
    const response = await apiClient.get<TopAccountsResponse>("/dashboard/top-accounts", {
      params,
    });
    return response.data;
  },

  async getTopSalesRep(params?: DashboardRequestParams): Promise<TopSalesRepResponse> {
    const response = await apiClient.get<TopSalesRepResponse>("/dashboard/top-sales-rep", {
      params,
    });
    return response.data;
  },

  async getRecentActivities(params?: DashboardRequestParams): Promise<RecentActivitiesResponse> {
    const response = await apiClient.get<RecentActivitiesResponse>("/dashboard/recent-activities", {
      params,
    });
    return response.data;
  },

  async getActivityTrends(params?: DashboardRequestParams): Promise<ActivityTrendsResponse> {
    const response = await apiClient.get<ActivityTrendsResponse>("/dashboard/activity-trends", {
      params,
    });
    return response.data;
  },
};

