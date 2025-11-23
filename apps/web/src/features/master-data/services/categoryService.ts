import apiClient from "@/lib/api-client";
import type {
  Category,
  ListCategoriesResponse,
  SingleCategoryResponse,
  CreateCategoryFormData,
  UpdateCategoryFormData,
} from "../types/category";

export const categoryService = {
  async list(params?: {
    page?: number;
    per_page?: number;
    type?: "diagnosis" | "procedure";
    status?: string;
    search?: string;
  }): Promise<ListCategoriesResponse> {
    const response = await apiClient.get<ListCategoriesResponse>(
      "/master-data/categories",
      { params }
    );
    return response.data;
  },

  async getById(id: string): Promise<SingleCategoryResponse> {
    const response = await apiClient.get<SingleCategoryResponse>(
      `/master-data/categories/${id}`
    );
    return response.data;
  },

  async create(data: CreateCategoryFormData): Promise<SingleCategoryResponse> {
    const response = await apiClient.post<SingleCategoryResponse>(
      "/master-data/categories",
      data
    );
    return response.data;
  },

  async update(
    id: string,
    data: UpdateCategoryFormData
  ): Promise<SingleCategoryResponse> {
    const response = await apiClient.put<SingleCategoryResponse>(
      `/master-data/categories/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/master-data/categories/${id}`);
  },
};

