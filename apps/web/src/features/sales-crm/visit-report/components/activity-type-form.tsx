"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createActivityTypeSchema, updateActivityTypeSchema, type CreateActivityTypeFormData, type UpdateActivityTypeFormData } from "../schemas/activity-type.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActivityType } from "../types/activity-type";
import { IconPicker } from "./icon-picker";

interface ActivityTypeFormProps {
  readonly activityType?: ActivityType;
  readonly onSubmit: (data: CreateActivityTypeFormData | UpdateActivityTypeFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function ActivityTypeForm({ activityType, onSubmit, onCancel, isLoading }: ActivityTypeFormProps) {
  const isEdit = !!activityType;
  const t = useTranslations("visitReportActivityType.form");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateActivityTypeFormData | UpdateActivityTypeFormData>({
    resolver: zodResolver(isEdit ? updateActivityTypeSchema : createActivityTypeSchema),
    defaultValues: activityType
      ? {
          name: activityType.name,
          code: activityType.code,
          description: activityType.description || "",
          icon: activityType.icon || "",
          badge_color: activityType.badge_color as "default" | "secondary" | "destructive" | "outline",
          status: activityType.status,
          order: activityType.order,
        }
      : {
          badge_color: "outline",
          status: "active",
          order: 0,
        },
  });

  const selectedStatus = watch("status");
  const selectedBadgeColor = watch("badge_color");

  const handleFormSubmit = async (data: CreateActivityTypeFormData | UpdateActivityTypeFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>{t("nameLabel")}</FieldLabel>
        <Input
          {...register("name")}
          placeholder={t("namePlaceholder")}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("codeLabel")}</FieldLabel>
        <Input
          {...register("code")}
          placeholder={t("codePlaceholder")}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t("codeHint")}
        </p>
        {errors.code && <FieldError>{errors.code.message}</FieldError>}
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
        <FieldLabel>{t("iconLabel")}</FieldLabel>
        <IconPicker
          value={watch("icon") ?? ""}
          onValueChange={(value) => setValue("icon", value, { shouldValidate: true })}
          placeholder={t("iconPlaceholder")}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t("iconHint")}
        </p>
        {errors.icon && <FieldError>{errors.icon.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("badgeColorLabel")}</FieldLabel>
        <Select
          value={selectedBadgeColor || "outline"}
          onValueChange={(value) => setValue("badge_color", value as "default" | "secondary" | "destructive" | "outline")}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("badgeColorPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{t("badgeColorDefault")}</SelectItem>
            <SelectItem value="secondary">{t("badgeColorSecondary")}</SelectItem>
            <SelectItem value="destructive">{t("badgeColorDestructive")}</SelectItem>
            <SelectItem value="outline">{t("badgeColorOutline")}</SelectItem>
          </SelectContent>
        </Select>
        {errors.badge_color && <FieldError>{errors.badge_color.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("orderLabel")}</FieldLabel>
        <Input
          type="number"
          {...register("order", { valueAsNumber: true })}
          placeholder={t("orderPlaceholder")}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t("orderHint")}
        </p>
        {errors.order && <FieldError>{errors.order.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("statusLabel")}</FieldLabel>
        <Select
          value={selectedStatus || "active"}
          onValueChange={(value) => setValue("status", value as "active" | "inactive")}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("statusPlaceholder")} />
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
          {isLoading ? t("submitting") : isEdit ? t("update") : t("create")}
        </Button>
      </div>
    </form>
  );
}

