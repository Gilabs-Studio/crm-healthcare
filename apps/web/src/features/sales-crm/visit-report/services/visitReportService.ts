import apiClient from "@/lib/api-client";
import type {
  VisitReport,
  ListVisitReportsResponse,
  VisitReportResponse,
  CreateVisitReportFormData,
  UpdateVisitReportFormData,
  CheckInFormData,
  CheckOutFormData,
  RejectFormData,
  UploadPhotoFormData,
} from "../types";

export const visitReportService = {
  async list(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    account_id?: string;
    sales_rep_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ListVisitReportsResponse> {
    const response = await apiClient.get<ListVisitReportsResponse>("/visit-reports", { params });
    return response.data;
  },

  async getById(id: string): Promise<VisitReportResponse> {
    const response = await apiClient.get<VisitReportResponse>(`/visit-reports/${id}`);
    return response.data;
  },

  async create(data: CreateVisitReportFormData): Promise<VisitReportResponse> {
    const response = await apiClient.post<VisitReportResponse>("/visit-reports", data);
    return response.data;
  },

  async update(id: string, data: UpdateVisitReportFormData): Promise<VisitReportResponse> {
    const response = await apiClient.put<VisitReportResponse>(`/visit-reports/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/visit-reports/${id}`);
  },

  async checkIn(id: string, data: CheckInFormData): Promise<VisitReportResponse> {
    const response = await apiClient.post<VisitReportResponse>(`/visit-reports/${id}/check-in`, data);
    return response.data;
  },

  async checkOut(id: string, data: CheckOutFormData): Promise<VisitReportResponse> {
    const response = await apiClient.post<VisitReportResponse>(`/visit-reports/${id}/check-out`, data);
    return response.data;
  },

  async approve(id: string): Promise<VisitReportResponse> {
    const response = await apiClient.post<VisitReportResponse>(`/visit-reports/${id}/approve`, {});
    return response.data;
  },

  async reject(id: string, data: RejectFormData): Promise<VisitReportResponse> {
    const response = await apiClient.post<VisitReportResponse>(`/visit-reports/${id}/reject`, data);
    return response.data;
  },

  async uploadPhoto(id: string, data: UploadPhotoFormData): Promise<VisitReportResponse> {
    const response = await apiClient.post<VisitReportResponse>(`/visit-reports/${id}/photos`, data);
    return response.data;
  },
};

