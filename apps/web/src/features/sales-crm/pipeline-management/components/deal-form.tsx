"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDealSchema,
  updateDealSchema,
  type CreateDealFormData,
  type UpdateDealFormData,
} from "../schemas/deal.schema";
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
import { usePipelines } from "../hooks/usePipelines";
import { useAccounts } from "@/features/sales-crm/account-management/hooks/useAccounts";
import { useContacts } from "@/features/sales-crm/account-management/hooks/useContacts";
import { useUsers } from "@/features/master-data/user-management/hooks/useUsers";
import type { Deal } from "../types";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface DealFormProps {
  readonly deal?: Deal;
  readonly onSubmit: (data: CreateDealFormData | UpdateDealFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function DealForm({ deal, onSubmit, onCancel, isLoading }: DealFormProps) {
  const t = useTranslations("pipelineManagement.dealForm");

  const isEdit = !!deal;
  const { data: pipelinesData } = usePipelines({ is_active: true });
  const { data: accountsData } = useAccounts({ status: "active", per_page: 100 });
  const { data: usersData } = useUsers({ status: "active", per_page: 100 });
  
  const pipelines = pipelinesData?.data || [];
  const accounts = accountsData?.data || [];
  const users = usersData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateDealFormData | UpdateDealFormData>({
    resolver: zodResolver(isEdit ? updateDealSchema : createDealSchema),
    defaultValues: deal
      ? {
          title: deal.title,
          description: deal.description || "",
          account_id: deal.account_id,
          contact_id: deal.contact_id || "",
          stage_id: deal.stage_id,
          value: deal.value / 100, // Convert from sen to rupiah
          probability: deal.probability,
          expected_close_date: deal.expected_close_date ? deal.expected_close_date.split("T")[0] : "",
          assigned_to: deal.assigned_to || "",
          source: deal.source || "",
          notes: deal.notes || "",
        }
      : {
          probability: 0,
        },
  });

  // Load contacts when account is selected
  const accountId = watch("account_id");
  const { data: contactsData } = useContacts({ 
    account_id: accountId || deal?.account_id, 
    per_page: 100 
  });
  const contacts = contactsData?.data || [];

  // Reset contact when account changes
  useEffect(() => {
    if (!isEdit && accountId && accountId !== (deal as { account_id?: string } | undefined)?.account_id) {
      setValue("contact_id", "");
    }
  }, [accountId, isEdit, deal, setValue]);

  const handleFormSubmit = async (data: CreateDealFormData | UpdateDealFormData) => {
    // Build submit data object, only including fields with valid values
    const submitData: Record<string, unknown> = {};

    // Helper function to check if value is valid (not empty, not "none", not undefined)
    const isValidValue = (value: unknown): boolean => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") {
        return value !== "" && value !== "none" && value.trim() !== "";
      }
      if (typeof value === "number") {
        return !isNaN(value);
      }
      return true;
    };

    // Required fields for create, optional for update
    if (isValidValue(data.title)) {
      submitData.title = data.title;
    }
    
    if (isValidValue(data.stage_id)) {
      submitData.stage_id = data.stage_id;
    }
    
    if (isValidValue(data.account_id)) {
      submitData.account_id = data.account_id;
    }

    // Convert value from rupiah to sen if provided
    // Always send value if it exists in form data (including 0)
    if (data.value !== undefined && data.value !== null && !isNaN(data.value as number)) {
      submitData.value = Math.round((data.value as number) * 100);
    }

    // Optional fields - only include if they have valid values
    if (isValidValue(data.description)) {
      submitData.description = data.description;
    }

    if (isValidValue(data.contact_id)) {
      submitData.contact_id = data.contact_id;
    }

    // Always send probability if it exists in form data (including 0)
    if (data.probability !== undefined && data.probability !== null && !isNaN(data.probability as number)) {
      submitData.probability = data.probability;
    }

    // For expected_close_date, only send if it's a valid date string (not empty)
    // Backend expects *time.Time, Gin can parse RFC3339 format automatically
    if (isValidValue(data.expected_close_date)) {
      // Convert date string to ISO format (RFC3339) for backend
      const dateStr = data.expected_close_date as string;
      if (dateStr) {
        // If it's already in YYYY-MM-DD format, convert to ISO format
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          submitData.expected_close_date = date.toISOString();
        }
      }
    }

    if (isValidValue(data.assigned_to)) {
      submitData.assigned_to = data.assigned_to;
    }

    // Status is only available in UpdateDealFormData
    if (isEdit && "status" in data && isValidValue(data.status)) {
      submitData.status = data.status;
    }

    if (isValidValue(data.source)) {
      submitData.source = data.source;
    }

    if (isValidValue(data.notes)) {
      submitData.notes = data.notes;
    }

    // For update, ensure at least one field is being updated
    if (isEdit && Object.keys(submitData).length === 0) {
      console.warn("No fields to update");
      return;
    }

    // Final cleanup: remove any undefined or null values
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === undefined || submitData[key] === null) {
        delete submitData[key];
      }
    });

    await onSubmit(submitData as CreateDealFormData | UpdateDealFormData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>{t("titleRequired")}</FieldLabel>
        <Input {...register("title")} placeholder={t("titlePlaceholder")} />
        {errors.title && <FieldError>{errors.title.message}</FieldError>}
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
        <FieldLabel>{t("accountRequired")}</FieldLabel>
        <Select
          value={watch("account_id") || ""}
          onValueChange={(value) => setValue("account_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("accountPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.account_id && <FieldError>{errors.account_id.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("contactLabel")}</FieldLabel>
        <Select
          value={watch("contact_id") || undefined}
          onValueChange={(value) => setValue("contact_id", value === "none" ? "" : value)}
          disabled={!watch("account_id") && !deal?.account_id}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("contactPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("contactNone")}</SelectItem>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.contact_id && <FieldError>{errors.contact_id.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("stageRequired")}</FieldLabel>
        <Select
          value={watch("stage_id") || ""}
          onValueChange={(value) => setValue("stage_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("stagePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {pipelines
              .filter((stage) => stage.is_active)
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.stage_id && <FieldError>{errors.stage_id.message}</FieldError>}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>{t("valueRequired")}</FieldLabel>
          <Input
            type="number"
            {...register("value", { valueAsNumber: true })}
            placeholder={t("valuePlaceholder")}
            min={0}
            step="0.01"
          />
          {errors.value && <FieldError>{errors.value.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("probabilityLabel")}</FieldLabel>
          <Input
            type="number"
            {...register("probability", { valueAsNumber: true })}
            placeholder={t("probabilityPlaceholder")}
            min={0}
            max={100}
          />
          {errors.probability && <FieldError>{errors.probability.message}</FieldError>}
        </Field>
      </div>

      <Field orientation="vertical">
        <FieldLabel>{t("expectedCloseDateLabel")}</FieldLabel>
        <Input type="date" {...register("expected_close_date")} />
        {errors.expected_close_date && <FieldError>{errors.expected_close_date.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("assignedToLabel")}</FieldLabel>
        <Select
          value={watch("assigned_to") || undefined}
          onValueChange={(value) => setValue("assigned_to", value === "none" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("assignedToPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("assignedToNone")}</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.assigned_to && <FieldError>{errors.assigned_to.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("sourceLabel")}</FieldLabel>
        <Input {...register("source")} placeholder={t("sourcePlaceholder")} />
        {errors.source && <FieldError>{errors.source.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("notesLabel")}</FieldLabel>
        <Textarea
          {...register("notes")}
          placeholder={t("notesPlaceholder")}
          rows={3}
        />
        {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
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

