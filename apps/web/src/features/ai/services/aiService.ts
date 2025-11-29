import apiClient from "@/lib/api-client";
import type {
  AnalyzeVisitReportRequest,
  AnalyzeVisitReportResponse,
  ChatRequest,
  ChatAPIResponse,
} from "../types";

export const aiService = {
  async analyzeVisitReport(
    data: AnalyzeVisitReportRequest
  ): Promise<AnalyzeVisitReportResponse> {
    const response = await apiClient.post<AnalyzeVisitReportResponse>(
      "/ai/analyze/visit-report",
      data
    );
    return response.data;
  },

  async chat(data: ChatRequest): Promise<ChatAPIResponse> {
    const response = await apiClient.post<ChatAPIResponse>("/ai/chat", data);
    return response.data;
  },
};

