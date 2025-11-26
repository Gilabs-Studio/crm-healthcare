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

export function GeneralSettingsForm() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

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
      toast.success("General settings updated successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage your company information and preferences</CardDescription>
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
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage your company information and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field orientation="vertical">
            <FieldLabel>Company Name</FieldLabel>
            <Input
              {...register("company_name")}
              placeholder="Your Company Name"
            />
            {errors.company_name && (
              <FieldError>{errors.company_name.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Company Email</FieldLabel>
            <Input
              type="email"
              {...register("company_email")}
              placeholder="company@example.com"
            />
            {errors.company_email && (
              <FieldError>{errors.company_email.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Company Phone</FieldLabel>
            <Input
              {...register("company_phone")}
              placeholder="+62 123 456 7890"
            />
            {errors.company_phone && (
              <FieldError>{errors.company_phone.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Company Address</FieldLabel>
            <Input
              {...register("company_address")}
              placeholder="Street Address, City, Country"
            />
            {errors.company_address && (
              <FieldError>{errors.company_address.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Company Logo URL</FieldLabel>
            <Input
              {...register("company_logo")}
              placeholder="https://example.com/logo.png"
            />
            {errors.company_logo && (
              <FieldError>{errors.company_logo.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Timezone</FieldLabel>
            <Input
              {...register("timezone")}
              placeholder="Asia/Jakarta"
            />
            {errors.timezone && (
              <FieldError>{errors.timezone.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Date Format</FieldLabel>
            <Input
              {...register("date_format")}
              placeholder="DD/MM/YYYY"
            />
            {errors.date_format && (
              <FieldError>{errors.date_format.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Currency</FieldLabel>
            <Input
              {...register("currency")}
              placeholder="IDR"
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
              {updateSettings.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


