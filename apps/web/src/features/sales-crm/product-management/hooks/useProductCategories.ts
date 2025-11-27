"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productCategoryService } from "../services/categoryService";
import type {
  CreateProductCategoryFormData,
  UpdateProductCategoryFormData,
} from "../schemas/category.schema";

export function useProductCategories() {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: () => productCategoryService.list(),
  });
}

export function useProductCategory(id: string) {
  return useQuery({
    queryKey: ["product-category", id],
    queryFn: () => productCategoryService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductCategoryFormData) => productCategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductCategoryFormData }) =>
      productCategoryService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["product-category", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productCategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}


