import apiClient from "@/lib/api-client";
import type {
  ListProductsResponse,
  ProductResponse,
  ListProductCategoriesResponse,
  ProductListParams,
} from "../types/product";
import type { CreateProductFormData, UpdateProductFormData } from "../schemas/product.schema";

export const productService = {
  async list(params?: ProductListParams): Promise<ListProductsResponse> {
    const response = await apiClient.get<ListProductsResponse>("/products", { params });
    return response.data;
  },

  async getById(id: string): Promise<ProductResponse> {
    const response = await apiClient.get<ProductResponse>(`/products/${id}`);
    return response.data;
  },

  async create(data: CreateProductFormData): Promise<ProductResponse> {
    const payload: Record<string, unknown> = {
      name: data.name,
      sku: data.sku,
      category_id: data.category_id,
      price: Math.round(data.price * 100),
    };

    if (data.barcode) {
      payload.barcode = data.barcode;
    }
    if (typeof data.cost === "number") {
      payload.cost = Math.round(data.cost * 100);
    }
    if (typeof data.stock === "number") {
      payload.stock = data.stock;
    }
    if (data.status) {
      payload.status = data.status;
    }
    if (typeof data.taxable === "boolean") {
      payload.taxable = data.taxable;
    }
    if (data.description) {
      payload.description = data.description;
    }

    const response = await apiClient.post<ProductResponse>("/products", payload);
    return response.data;
  },

  async update(id: string, data: UpdateProductFormData): Promise<ProductResponse> {
    const payload: Record<string, unknown> = {};

    if (data.name !== undefined) {
      payload.name = data.name;
    }
    if (data.sku !== undefined) {
      payload.sku = data.sku;
    }
    if (data.barcode !== undefined) {
      payload.barcode = data.barcode;
    }
    if (data.price !== undefined) {
      payload.price = Math.round(data.price * 100);
    }
    if (data.cost !== undefined) {
      payload.cost = Math.round(data.cost * 100);
    }
    if (data.stock !== undefined) {
      payload.stock = data.stock;
    }
    if (data.category_id !== undefined) {
      payload.category_id = data.category_id;
    }
    if (data.status !== undefined) {
      payload.status = data.status;
    }
    if (data.taxable !== undefined) {
      payload.taxable = data.taxable;
    }
    if (data.description !== undefined) {
      payload.description = data.description;
    }

    const response = await apiClient.put<ProductResponse>(`/products/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};

export const productCategoryService = {
  async list(): Promise<ListProductCategoriesResponse> {
    const response = await apiClient.get<ListProductCategoriesResponse>("/product-categories");
    return response.data;
  },
};


