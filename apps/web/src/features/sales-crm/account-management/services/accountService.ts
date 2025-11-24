import apiClient from "@/lib/api-client";
import type {
  Account,
  ListAccountsResponse,
  AccountResponse,
  CreateAccountFormData,
  UpdateAccountFormData,
} from "../types";

export const accountService = {
  async list(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    category?: string;
    assigned_to?: string;
  }): Promise<ListAccountsResponse> {
    const response = await apiClient.get<ListAccountsResponse>("/accounts", { params });
    return response.data;
  },

  async getById(id: string): Promise<AccountResponse> {
    const response = await apiClient.get<AccountResponse>(`/accounts/${id}`);
    return response.data;
  },

  async create(data: CreateAccountFormData): Promise<AccountResponse> {
    const response = await apiClient.post<AccountResponse>("/accounts", data);
    return response.data;
  },

  async update(id: string, data: UpdateAccountFormData): Promise<AccountResponse> {
    const response = await apiClient.put<AccountResponse>(`/accounts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/accounts/${id}`);
  },
};

