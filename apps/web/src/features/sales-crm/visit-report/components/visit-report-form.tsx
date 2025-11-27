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
import { useEffect, useMemo, useState } from "react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("visitReportForm");

  // Parse visit_date from backend (YYYY-MM-DD) to Date and time
  const parseVisitDate = (dateString: string): { date: Date; time: string | null } => {
    if (!dateString) {
      const now = new Date();
      return { date: now, time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}` };
    }
    
    // Check if it's already datetime format (YYYY-MM-DD HH:mm)
    const datetimeMatch = dateString.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/);
    if (datetimeMatch) {
      const [, datePart, timePart] = datetimeMatch;
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);
      const date = new Date(year, month - 1, day, hours, minutes);
      return { date, time: timePart };
    }
    
    // Otherwise parse as date only
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return { date, time: "09:00" }; // Default time
  };

  const defaultVisitDateTime = useMemo(() => {
    if (visitReport?.visit_date) {
      return parseVisitDate(visitReport.visit_date);
    }
    const now = new Date();
    return {
      date: now,
      time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
    };
  }, [visitReport?.visit_date]);

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
          visit_date: visitReport.visit_date.includes(" ") 
            ? visitReport.visit_date 
            : `${visitReport.visit_date} ${defaultVisitDateTime.time}`,
          purpose: visitReport.purpose,
          notes: visitReport.notes || "",
        }
      : {
          visit_date: `${new Date().toISOString().split("T")[0]} ${defaultVisitDateTime.time}`,
        },
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultVisitDateTime.date);
  const [selectedTime, setSelectedTime] = useState<string | null>(defaultVisitDateTime.time);

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

  const handleDateTimeChange = (date: Date | null, time: string | null) => {
    if (date && time) {
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      const datetimeStr = `${dateStr} ${time}`;
      setValue("visit_date", datetimeStr, { shouldValidate: true });
      setSelectedDate(date);
      setSelectedTime(time);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>
          {t("fields.accountLabel")} *
        </FieldLabel>
        <Select
          value={watch("account_id") || undefined}
          onValueChange={(value) => setValue("account_id", value)}
          disabled={isEdit}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("fields.accountPlaceholder")} />
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
          <FieldLabel>{t("fields.contactLabel")}</FieldLabel>
          <Select
            value={watch("contact_id") || undefined}
            onValueChange={(value) => setValue("contact_id", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("fields.contactPlaceholder")} />
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
        <FieldLabel>
          {t("fields.visitDateTimeLabel")} *
        </FieldLabel>
        <DateTimePicker
          date={selectedDate}
          time={selectedTime}
          onDateChange={handleDateTimeChange}
        />
        {errors.visit_date && <FieldError>{errors.visit_date.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>
          {t("fields.purposeLabel")} *
        </FieldLabel>
        <Textarea
          {...register("purpose")}
          placeholder={t("fields.purposePlaceholder")}
          rows={4}
        />
        {errors.purpose && <FieldError>{errors.purpose.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("fields.notesLabel")}</FieldLabel>
        <Textarea
          {...register("notes")}
          placeholder={t("fields.notesPlaceholder")}
          rows={3}
        />
        {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
      </Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {t("buttons.cancel")}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? t("buttons.submitting")
            : isEdit
              ? t("buttons.submitUpdate")
              : t("buttons.submitCreate")}
        </Button>
      </div>
    </form>
  );
}

