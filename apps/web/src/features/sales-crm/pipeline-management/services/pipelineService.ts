import apiClient from "@/lib/api-client";
import type {
  ListPipelineStagesResponse,
  PipelineStageResponse,
  PipelineSummaryResponse,
  ForecastResponse,
} from "../types";

export const pipelineService = {
  async listStages(params?: {
    is_active?: boolean;
  }): Promise<ListPipelineStagesResponse> {
    const response = await apiClient.get<ListPipelineStagesResponse>("/pipelines", { params });
    return response.data;
  },

  async getStageById(id: string): Promise<PipelineStageResponse> {
    const response = await apiClient.get<PipelineStageResponse>(`/pipelines/${id}`);
    return response.data;
  },

  async getSummary(): Promise<PipelineSummaryResponse> {
    const response = await apiClient.get<PipelineSummaryResponse>("/pipelines/summary");
    return response.data;
  },

  async getForecast(params?: {
    period?: "month" | "quarter" | "year";
    start_date?: string;
    end_date?: string;
  }): Promise<ForecastResponse> {
    const response = await apiClient.get<ForecastResponse>("/pipelines/forecast", { params });
    return response.data;
  },

  async createStage(data: {
    name: string;
    code: string;
    order: number;
    color?: string;
    is_active?: boolean;
    is_won?: boolean;
    is_lost?: boolean;
    description?: string;
  }): Promise<PipelineStageResponse> {
    const response = await apiClient.post<PipelineStageResponse>("/pipelines", data);
    return response.data;
  },

  async updateStage(
    id: string,
    data: {
      name?: string;
      code?: string;
      order?: number;
      color?: string;
      is_active?: boolean;
      is_won?: boolean;
      is_lost?: boolean;
      description?: string;
    }
  ): Promise<PipelineStageResponse> {
    const response = await apiClient.put<PipelineStageResponse>(`/pipelines/${id}`, data);
    return response.data;
  },

  async deleteStage(id: string): Promise<void> {
    await apiClient.delete(`/pipelines/${id}`);
  },

  async updateStagesOrder(data: {
    stages: Array<{ id: string; order: number }>;
  }): Promise<ListPipelineStagesResponse> {
    const response = await apiClient.put<ListPipelineStagesResponse>("/pipelines/order", data);
    return response.data;
  },
};

