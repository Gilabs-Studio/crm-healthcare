import apiClient from "@/lib/api-client";
import type {
  ListDealsResponse,
  DealResponse,
} from "../types";
import type { CreateDealFormData, UpdateDealFormData, MoveDealFormData } from "../schemas/deal.schema";

export const dealService = {
  async list(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    stage_id?: string;
    account_id?: string;
    assigned_to?: string;
    status?: "open" | "won" | "lost";
    source?: string;
  }): Promise<ListDealsResponse> {
    const response = await apiClient.get<ListDealsResponse>("/deals", { params });
    return response.data;
  },

  async getById(id: string): Promise<DealResponse> {
    const response = await apiClient.get<DealResponse>(`/deals/${id}`);
    return response.data;
  },

  async create(data: CreateDealFormData): Promise<DealResponse> {
    const response = await apiClient.post<DealResponse>("/deals", data);
    return response.data;
  },

  async update(id: string, data: UpdateDealFormData): Promise<DealResponse> {
    const response = await apiClient.put<DealResponse>(`/deals/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/deals/${id}`);
  },

  async move(id: string, data: MoveDealFormData): Promise<DealResponse> {
    const response = await apiClient.post<DealResponse>(`/deals/${id}/move`, data);
    return response.data;
  },
};

