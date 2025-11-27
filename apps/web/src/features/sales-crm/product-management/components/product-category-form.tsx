"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductCategorySchema,
  updateProductCategorySchema,
  type CreateProductCategoryFormData,
  type UpdateProductCategoryFormData,
} from "../schemas/category.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ProductCategory } from "../types/category";

interface ProductCategoryFormProps {
  readonly category?: ProductCategory;
  readonly onSubmit: (
    data: CreateProductCategoryFormData | UpdateProductCategoryFormData,
  ) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function ProductCategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading,
}: ProductCategoryFormProps) {
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductCategoryFormData | UpdateProductCategoryFormData>({
    resolver: zodResolver(isEdit ? updateProductCategorySchema : createProductCategorySchema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description,
          status: category.status,
        }
      : {
          status: "active",
        },
  });

  const handleFormSubmit = async (
    data: CreateProductCategoryFormData | UpdateProductCategoryFormData,
  ) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>Name *</FieldLabel>
        <Input {...register("name")} placeholder="Category name (e.g., Prescription Drug)" />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Slug</FieldLabel>
        <Input {...register("slug")} placeholder="Slug (optional, auto-generated if empty)" />
        {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Description</FieldLabel>
        <Textarea
          {...register("description")}
          placeholder="Description (optional)"
          rows={3}
        />
        {errors.description && <FieldError>{errors.description.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Status</FieldLabel>
        <select
          {...register("status")}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {errors.status && <FieldError>{errors.status.message}</FieldError>}
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}


