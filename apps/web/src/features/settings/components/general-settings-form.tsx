"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { generalSettingsSchema, type GeneralSettingsFormData } from "../schemas/settings.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export function GeneralSettingsForm() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const t = useTranslations("settings.general");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      company_name: "",
      company_email: "",
      company_phone: "",
      company_address: "",
      company_logo: "",
      timezone: "Asia/Jakarta",
      date_format: "DD/MM/YYYY",
      currency: "IDR",
    },
  });

  useEffect(() => {
    if (data?.data?.general) {
      reset({
        company_name: data.data.general.company_name || "",
        company_email: data.data.general.company_email || "",
        company_phone: data.data.general.company_phone || "",
        company_address: data.data.general.company_address || "",
        company_logo: data.data.general.company_logo || "",
        timezone: data.data.general.timezone || "Asia/Jakarta",
        date_format: data.data.general.date_format || "DD/MM/YYYY",
        currency: data.data.general.currency || "IDR",
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: GeneralSettingsFormData) => {
    try {
      await updateSettings.mutateAsync({
        general: formData as Record<string, string>,
      });
      toast.success(t("toast.success"));
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("loading.title")}</CardTitle>
          <CardDescription>{t("loading.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field orientation="vertical">
            <FieldLabel>{t("fields.companyName")}</FieldLabel>
            <Input
              {...register("company_name")}
              placeholder={t("placeholders.companyName")}
            />
            {errors.company_name && (
              <FieldError>{errors.company_name.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.companyEmail")}</FieldLabel>
            <Input
              type="email"
              {...register("company_email")}
              placeholder={t("placeholders.companyEmail")}
            />
            {errors.company_email && (
              <FieldError>{errors.company_email.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.companyPhone")}</FieldLabel>
            <Input
              {...register("company_phone")}
              placeholder={t("placeholders.companyPhone")}
            />
            {errors.company_phone && (
              <FieldError>{errors.company_phone.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.companyAddress")}</FieldLabel>
            <Input
              {...register("company_address")}
              placeholder={t("placeholders.companyAddress")}
            />
            {errors.company_address && (
              <FieldError>{errors.company_address.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.companyLogo")}</FieldLabel>
            <Input
              {...register("company_logo")}
              placeholder={t("placeholders.companyLogo")}
            />
            {errors.company_logo && (
              <FieldError>{errors.company_logo.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.timezone")}</FieldLabel>
            <Input
              {...register("timezone")}
              placeholder={t("placeholders.timezone")}
            />
            {errors.timezone && (
              <FieldError>{errors.timezone.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.dateFormat")}</FieldLabel>
            <Input
              {...register("date_format")}
              placeholder={t("placeholders.dateFormat")}
            />
            {errors.date_format && (
              <FieldError>{errors.date_format.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.currency")}</FieldLabel>
            <Input
              {...register("currency")}
              placeholder={t("placeholders.currency")}
            />
            {errors.currency && (
              <FieldError>{errors.currency.message}</FieldError>
            )}
          </Field>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? t("buttons.saving") : t("buttons.saveChanges")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


