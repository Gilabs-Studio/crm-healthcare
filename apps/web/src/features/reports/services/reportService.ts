import apiClient from "@/lib/api-client";
import type {
  VisitReportReportResponse,
  PipelineReportResponse,
  SalesPerformanceReportResponse,
  AccountActivityReportResponse,
  ReportRequestParams,
} from "../types";

export const reportService = {
  async getVisitReportReport(
    params?: ReportRequestParams
  ): Promise<VisitReportReportResponse> {
    const response = await apiClient.get<VisitReportReportResponse>("/reports/visit-reports", {
      params,
    });
    return response.data;
  },

  async getPipelineReport(params?: ReportRequestParams): Promise<PipelineReportResponse> {
    const response = await apiClient.get<PipelineReportResponse>("/reports/pipeline", {
      params,
    });
    return response.data;
  },

  async getSalesPerformanceReport(
    params?: ReportRequestParams
  ): Promise<SalesPerformanceReportResponse> {
    const response = await apiClient.get<SalesPerformanceReportResponse>(
      "/reports/sales-performance",
      {
        params,
      }
    );
    return response.data;
  },

  async getAccountActivityReport(
    params?: ReportRequestParams
  ): Promise<AccountActivityReportResponse> {
    const response = await apiClient.get<AccountActivityReportResponse>(
      "/reports/account-activity",
      {
        params,
      }
    );
    return response.data;
  },
};

