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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("productManagement.categoryForm");

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
        <FieldLabel>{t("nameLabel")} *</FieldLabel>
        <Input
          {...register("name")}
          placeholder={t("namePlaceholder")}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("slugLabel")}</FieldLabel>
        <Input
          {...register("slug")}
          placeholder={t("slugPlaceholder")}
        />
        {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("descriptionLabel")}</FieldLabel>
        <Textarea
          {...register("description")}
          placeholder={t("descriptionPlaceholder")}
          rows={3}
        />
        {errors.description && <FieldError>{errors.description.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("statusLabel")}</FieldLabel>
        <select
          {...register("status")}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="active">{t("statusActive")}</option>
          <option value="inactive">{t("statusInactive")}</option>
        </select>
        {errors.status && <FieldError>{errors.status.message}</FieldError>}
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("submitting") : isEdit ? t("submitUpdate") : t("submitCreate")}
        </Button>
      </div>
    </form>
  );
}


