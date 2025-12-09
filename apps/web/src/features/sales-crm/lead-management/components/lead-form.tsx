"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLeadSchema,
  updateLeadSchema,
  type CreateLeadFormData,
  type UpdateLeadFormData,
} from "../schemas/lead.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";
import { useLeadFormData } from "../hooks/useLeads";
import { useUsers } from "@/features/master-data/user-management/hooks/useUsers";
import type { Lead } from "../types";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadFormProps {
  readonly lead?: Lead;
  readonly onSubmit: (data: CreateLeadFormData | UpdateLeadFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function LeadForm({ lead, onSubmit, onCancel, isLoading }: LeadFormProps) {
  const isEdit = !!lead;
  const { data: formData, isLoading: isLoadingFormData } = useLeadFormData();
  const { data: usersData } = useUsers({ per_page: 100, status: "active" });
  const users = usersData?.data ?? [];
  const t = useTranslations("leadManagement.leadForm.fields");
  const tButtons = useTranslations("leadManagement.leadForm.buttons");

  const leadSources = formData?.data?.lead_sources ?? [];
  const leadStatuses = formData?.data?.lead_statuses ?? [];
  const industries = formData?.data?.industries ?? [];
  const provinces = formData?.data?.provinces ?? [];
  const defaults = formData?.data?.defaults;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateLeadFormData | UpdateLeadFormData>({
    resolver: zodResolver(isEdit ? updateLeadSchema : createLeadSchema),
    defaultValues: lead
      ? {
          first_name: lead.first_name,
          last_name: lead.last_name || "",
          company_name: lead.company_name || "",
          email: lead.email,
          phone: lead.phone || "",
          job_title: lead.job_title || "",
          industry: lead.industry || "",
          lead_source: lead.lead_source,
          lead_status: lead.lead_status,
          lead_score: lead.lead_score,
          assigned_to: lead.assigned_to || "",
          notes: lead.notes || "",
          address: lead.address || "",
          city: lead.city || "",
          province: lead.province || "",
          postal_code: lead.postal_code || "",
          country: lead.country || "",
          website: lead.website || "",
        }
      : {
          lead_status: defaults?.lead_status || "new",
          lead_score: defaults?.lead_score || 0,
          country: defaults?.country || "Indonesia",
        },
  });

  useEffect(() => {
    if (!isEdit && defaults) {
      setValue("lead_status", defaults.lead_status);
      setValue("lead_score", defaults.lead_score);
      setValue("country", defaults.country);
    }
  }, [defaults, isEdit, setValue]);

  const handleFormSubmit = async (data: CreateLeadFormData | UpdateLeadFormData) => {
    await onSubmit(data);
  };

  if (isLoadingFormData) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>
            {t("firstNameLabel")} *
          </FieldLabel>
          <Input {...register("first_name")} placeholder={t("firstNamePlaceholder")} />
          {errors.first_name && <FieldError>{errors.first_name.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("lastNameLabel")}</FieldLabel>
          <Input {...register("last_name")} placeholder={t("lastNamePlaceholder")} />
          {errors.last_name && <FieldError>{errors.last_name.message}</FieldError>}
        </Field>
      </div>

      <Field orientation="vertical">
        <FieldLabel>{t("emailLabel")} *</FieldLabel>
        <Input type="email" {...register("email")} placeholder={t("emailPlaceholder")} />
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>{t("phoneLabel")}</FieldLabel>
          <Input {...register("phone")} placeholder={t("phonePlaceholder")} />
          {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("companyNameLabel")}</FieldLabel>
          <Input {...register("company_name")} placeholder={t("companyNamePlaceholder")} />
          {errors.company_name && <FieldError>{errors.company_name.message}</FieldError>}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>{t("jobTitleLabel")}</FieldLabel>
          <Input {...register("job_title")} placeholder={t("jobTitlePlaceholder")} />
          {errors.job_title && <FieldError>{errors.job_title.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("industryLabel")}</FieldLabel>
          <Select
            value={watch("industry") || undefined}
            onValueChange={(value) => setValue("industry", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("industryPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <FieldError>{errors.industry.message}</FieldError>}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>
            {t("leadSourceLabel")} *
          </FieldLabel>
          <Select
            value={watch("lead_source") || ""}
            onValueChange={(value) => setValue("lead_source", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("leadSourcePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {leadSources.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.lead_source && <FieldError>{errors.lead_source.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("leadStatusLabel")}</FieldLabel>
          <Select
            value={watch("lead_status") || "new"}
            onValueChange={(value) => setValue("lead_status", value as "new" | "contacted" | "qualified" | "converted" | "lost")}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("leadStatusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {leadStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.lead_status && <FieldError>{errors.lead_status.message}</FieldError>}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>{t("leadScoreLabel")}</FieldLabel>
          <NumberInput
            value={watch("lead_score") ?? 0}
            onChange={(value) => setValue("lead_score", value ?? 0)}
            allowDecimal={false}
            placeholder="0-100"
          />
          {errors.lead_score && <FieldError>{errors.lead_score.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("assignedToLabel")}</FieldLabel>
          <Select
            value={watch("assigned_to") || undefined}
            onValueChange={(value) => setValue("assigned_to", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("assignedToPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assigned_to && <FieldError>{errors.assigned_to.message}</FieldError>}
        </Field>
      </div>

      <Field orientation="vertical">
        <FieldLabel>{t("addressLabel")}</FieldLabel>
        <Textarea {...register("address")} placeholder={t("addressPlaceholder")} rows={3} />
        {errors.address && <FieldError>{errors.address.message}</FieldError>}
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field orientation="vertical">
          <FieldLabel>{t("cityLabel")}</FieldLabel>
          <Input {...register("city")} placeholder={t("cityPlaceholder")} />
          {errors.city && <FieldError>{errors.city.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("provinceLabel")}</FieldLabel>
          <Select
            value={watch("province") || undefined}
            onValueChange={(value) => setValue("province", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("provincePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.province && <FieldError>{errors.province.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("postalCodeLabel")}</FieldLabel>
          <Input {...register("postal_code")} placeholder={t("postalCodePlaceholder")} />
          {errors.postal_code && <FieldError>{errors.postal_code.message}</FieldError>}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>{t("countryLabel")}</FieldLabel>
          <Input {...register("country")} placeholder={t("countryPlaceholder")} />
          {errors.country && <FieldError>{errors.country.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("websiteLabel")}</FieldLabel>
          <Input {...register("website")} placeholder={t("websitePlaceholder")} type="url" />
          {errors.website && <FieldError>{errors.website.message}</FieldError>}
        </Field>
      </div>

      <Field orientation="vertical">
        <FieldLabel>{t("notesLabel")}</FieldLabel>
        <Textarea {...register("notes")} placeholder={t("notesPlaceholder")} rows={4} />
        {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
      </Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {tButtons("cancel")}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? tButtons("submitting")
            : isEdit
              ? tButtons("submitUpdate")
              : tButtons("submitCreate")}
        </Button>
      </div>
    </form>
  );
}

