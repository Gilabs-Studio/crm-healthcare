"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    watch,
    setValue,
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
        <Select
          value={watch("badge_color") || "outline"}
          onValueChange={(value) => setValue("badge_color", value as "default" | "secondary" | "outline" | "success" | "warning" | "active")}
          disabled={isLoading}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder={t("badgeColorLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{t("badgeColorOptions.default")}</SelectItem>
            <SelectItem value="secondary">{t("badgeColorOptions.secondary")}</SelectItem>
            <SelectItem value="outline">{t("badgeColorOptions.outline")}</SelectItem>
            <SelectItem value="success">{t("badgeColorOptions.success")}</SelectItem>
            <SelectItem value="warning">{t("badgeColorOptions.warning")}</SelectItem>
            <SelectItem value="active">{t("badgeColorOptions.active")}</SelectItem>
          </SelectContent>
        </Select>
        {errors.badge_color && <FieldError>{errors.badge_color.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="status">{t("statusLabel")}</FieldLabel>
        <Select
          value={watch("status") || "active"}
          onValueChange={(value) => setValue("status", value as "active" | "inactive")}
          disabled={isLoading}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder={t("statusLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t("statusActive")}</SelectItem>
            <SelectItem value="inactive">{t("statusInactive")}</SelectItem>
          </SelectContent>
        </Select>
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

