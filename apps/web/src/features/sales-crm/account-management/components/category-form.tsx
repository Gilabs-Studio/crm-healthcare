"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { createCategorySchema, updateCategorySchema, type CreateCategoryFormData, type UpdateCategoryFormData } from "../schemas/category.schema";
import type { Category } from "../types";
import { useTranslations } from "next-intl";

interface CategoryFormProps {
  readonly category?: Category;
  readonly onSubmit: (data: CreateCategoryFormData | UpdateCategoryFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function CategoryForm({ category, onSubmit, onCancel, isLoading = false }: CategoryFormProps) {
  const isEdit = !!category;
  const schema = isEdit ? updateCategorySchema : createCategorySchema;
  const t = useTranslations("accountManagement.categoryForm");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCategoryFormData | UpdateCategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? {
          name: category.name,
          code: category.code,
          description: category.description || "",
          badge_color: category.badge_color,
          status: category.status,
        }
      : {
          badge_color: "outline",
          status: "active",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="name">{t("nameLabel")}</FieldLabel>
        <Input
          id="name"
          {...register("name")}
          placeholder={t("namePlaceholder")}
          disabled={isLoading}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="code">{t("codeLabel")}</FieldLabel>
        <Input
          id="code"
          {...register("code")}
          placeholder={t("codePlaceholder")}
          disabled={isLoading || isEdit}
        />
        {isEdit && (
          <p className="text-xs text-muted-foreground mt-1">
            {t("codeHint")}
          </p>
        )}
        {errors.code && <FieldError>{errors.code.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="description">{t("descriptionLabel")}</FieldLabel>
        <Input
          id="description"
          {...register("description")}
          placeholder={t("descriptionPlaceholder")}
          disabled={isLoading}
        />
        {errors.description && <FieldError>{errors.description.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="badge_color">{t("badgeColorLabel")}</FieldLabel>
        <select
          id="badge_color"
          {...register("badge_color")}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="default">{t("badgeColorOptions.default")}</option>
          <option value="secondary">{t("badgeColorOptions.secondary")}</option>
          <option value="outline">{t("badgeColorOptions.outline")}</option>
          <option value="success">{t("badgeColorOptions.success")}</option>
          <option value="warning">{t("badgeColorOptions.warning")}</option>
          <option value="active">{t("badgeColorOptions.active")}</option>
        </select>
        {errors.badge_color && <FieldError>{errors.badge_color.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="status">{t("statusLabel")}</FieldLabel>
        <select
          id="status"
          {...register("status")}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="active">{t("statusActive")}</option>
          <option value="inactive">{t("statusInactive")}</option>
        </select>
        {errors.status && <FieldError>{errors.status.message}</FieldError>}
      </Field>

      <div className="flex justify-end gap-2 pt-4">
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

