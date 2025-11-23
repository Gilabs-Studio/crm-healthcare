import apiClient from "@/lib/api-client";
import type {
  Diagnosis,
  ListDiagnosesResponse,
  DiagnosisResponse,
  CreateDiagnosisFormData,
  UpdateDiagnosisFormData,
  Procedure,
  ListProceduresResponse,
  ProcedureResponse,
  CreateProcedureFormData,
  UpdateProcedureFormData,
} from "../types";

export const diagnosisService = {
  async list(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<ListDiagnosesResponse> {
    const response = await apiClient.get<ListDiagnosesResponse>("/master-data/diagnosis", { params });
    return response.data;
  },

  async getById(id: string): Promise<DiagnosisResponse> {
    const response = await apiClient.get<DiagnosisResponse>(`/master-data/diagnosis/${id}`);
    return response.data;
  },

  async search(params: {
    query: string;
    limit?: number;
    status?: string;
  }): Promise<{ success: boolean; data: Diagnosis[] }> {
    const response = await apiClient.get<{ success: boolean; data: Diagnosis[] }>(
      "/master-data/diagnosis/search",
      { params }
    );
    return response.data;
  },

  async create(data: CreateDiagnosisFormData): Promise<DiagnosisResponse> {
    const response = await apiClient.post<DiagnosisResponse>("/master-data/diagnosis", data);
    return response.data;
  },

  async update(id: string, data: UpdateDiagnosisFormData): Promise<DiagnosisResponse> {
    const response = await apiClient.put<DiagnosisResponse>(`/master-data/diagnosis/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/master-data/diagnosis/${id}`);
  },
};

export const procedureService = {
  async list(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<ListProceduresResponse> {
    const response = await apiClient.get<ListProceduresResponse>("/master-data/procedures", { params });
    return response.data;
  },

  async getById(id: string): Promise<ProcedureResponse> {
    const response = await apiClient.get<ProcedureResponse>(`/master-data/procedures/${id}`);
    return response.data;
  },

  async search(params: {
    query: string;
    limit?: number;
    status?: string;
  }): Promise<{ success: boolean; data: Procedure[] }> {
    const response = await apiClient.get<{ success: boolean; data: Procedure[] }>(
      "/master-data/procedures/search",
      { params }
    );
    return response.data;
  },

  async create(data: CreateProcedureFormData): Promise<ProcedureResponse> {
    const response = await apiClient.post<ProcedureResponse>("/master-data/procedures", data);
    return response.data;
  },

  async update(id: string, data: UpdateProcedureFormData): Promise<ProcedureResponse> {
    const response = await apiClient.put<ProcedureResponse>(`/master-data/procedures/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/master-data/procedures/${id}`);
  },
};

