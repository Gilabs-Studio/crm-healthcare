"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createVisitReportSchema,
  updateVisitReportSchema,
  type CreateVisitReportFormData,
  type UpdateVisitReportFormData,
} from "../schemas/visit-report.schema";
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
import { useAccounts } from "../../account-management/hooks/useAccounts";
import { useContacts } from "../../account-management/hooks/useContacts";
import type { VisitReport } from "../types";
import { useEffect } from "react";

interface VisitReportFormProps {
  readonly visitReport?: VisitReport;
  readonly onSubmit: (data: CreateVisitReportFormData | UpdateVisitReportFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function VisitReportForm({
  visitReport,
  onSubmit,
  onCancel,
  isLoading,
}: VisitReportFormProps) {
  const isEdit = !!visitReport;
  const { data: accountsData } = useAccounts({ per_page: 100 });
  const accounts = accountsData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateVisitReportFormData | UpdateVisitReportFormData>({
    resolver: zodResolver(isEdit ? updateVisitReportSchema : createVisitReportSchema),
    defaultValues: visitReport
      ? {
          account_id: visitReport.account_id,
          contact_id: visitReport.contact_id || undefined,
          visit_date: visitReport.visit_date,
          purpose: visitReport.purpose,
          notes: visitReport.notes || "",
        }
      : {
          visit_date: new Date().toISOString().split("T")[0],
        },
  });

  const selectedAccountId = watch("account_id");
  const { data: contactsData } = useContacts({
    account_id: selectedAccountId || "",
    per_page: 100,
  });
  const contacts = contactsData?.data || [];

  // Reset contact when account changes
  useEffect(() => {
    if (selectedAccountId && !isEdit) {
      setValue("contact_id", undefined);
    }
  }, [selectedAccountId, isEdit, setValue]);

  const handleFormSubmit = async (data: CreateVisitReportFormData | UpdateVisitReportFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>Account *</FieldLabel>
        <Select
          value={watch("account_id") || ""}
          onValueChange={(value) => setValue("account_id", value)}
          disabled={isEdit}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts
              .filter((account) => account.status === "active")
              .map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} {account.category && `(${account.category.name})`}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.account_id && <FieldError>{errors.account_id.message}</FieldError>}
      </Field>

      {selectedAccountId && (
        <Field orientation="vertical">
          <FieldLabel>Contact</FieldLabel>
          <Select
            value={watch("contact_id") || undefined}
            onValueChange={(value) => setValue("contact_id", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a contact (optional)" />
            </SelectTrigger>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name} {contact.role && `(${contact.role.name})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contact_id && <FieldError>{errors.contact_id.message}</FieldError>}
        </Field>
      )}

      <Field orientation="vertical">
        <FieldLabel>Visit Date *</FieldLabel>
        <Input type="date" {...register("visit_date")} />
        {errors.visit_date && <FieldError>{errors.visit_date.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Purpose *</FieldLabel>
        <Textarea
          {...register("purpose")}
          placeholder="Describe the purpose of this visit"
          rows={4}
        />
        {errors.purpose && <FieldError>{errors.purpose.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Notes</FieldLabel>
        <Textarea
          {...register("notes")}
          placeholder="Additional notes about the visit"
          rows={3}
        />
        {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
      </Field>

      <div className="flex justify-end gap-2 pt-4">
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

