import apiClient from "@/lib/api-client";
import type {
  ProductCategory,
  ListProductCategoriesResponse,
  ProductCategoryResponse,
} from "../types/category";
import type {
  CreateProductCategoryFormData,
  UpdateProductCategoryFormData,
} from "../schemas/category.schema";

export const productCategoryService = {
  async list(): Promise<ListProductCategoriesResponse> {
    const response = await apiClient.get<ListProductCategoriesResponse>("/product-categories");
    return response.data;
  },

  async getById(id: string): Promise<ProductCategory> {
    const response = await apiClient.get<ProductCategoryResponse>(`/product-categories/${id}`);
    return response.data.data;
  },

  async create(data: CreateProductCategoryFormData): Promise<ProductCategory> {
    const payload: Record<string, unknown> = {
      name: data.name,
      status: data.status ?? "active",
    };

    if (data.slug) {
      payload.slug = data.slug;
    }
    if (data.description) {
      payload.description = data.description;
    }

    const response = await apiClient.post<ProductCategoryResponse>("/product-categories", payload);
    return response.data.data;
  },

  async update(id: string, data: UpdateProductCategoryFormData): Promise<ProductCategory> {
    const payload: Record<string, unknown> = {};

    if (data.name !== undefined) {
      payload.name = data.name;
    }
    if (data.slug !== undefined) {
      payload.slug = data.slug;
    }
    if (data.description !== undefined) {
      payload.description = data.description;
    }
    if (data.status !== undefined) {
      payload.status = data.status;
    }

    const response = await apiClient.put<ProductCategoryResponse>(`/product-categories/${id}`, payload);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/product-categories/${id}`);
  },
};


