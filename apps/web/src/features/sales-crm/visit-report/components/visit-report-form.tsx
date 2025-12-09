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
import { useDeals } from "../../pipeline-management/hooks/useDeals";
import { useLeads } from "../../lead-management/hooks/useLeads";
import type { VisitReport } from "../types";
import { useEffect, useMemo, useState } from "react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, TrendingUp, Building2 } from "lucide-react";

interface VisitReportFormProps {
  readonly visitReport?: VisitReport;
  readonly onSubmit: (data: CreateVisitReportFormData | UpdateVisitReportFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
  readonly open?: boolean; // Track if dialog is open to reset form
}

export function VisitReportForm({
  visitReport,
  onSubmit,
  onCancel,
  isLoading,
  open = true, // Default to true if not provided
}: VisitReportFormProps) {
  const isEdit = !!visitReport;
  const { data: accountsData } = useAccounts({ per_page: 100 });
  const accounts = accountsData?.data || [];
  const { data: dealsData } = useDeals({ per_page: 100, status: "open" });
  const deals = dealsData?.data || [];
  // Fetch all leads (no status filter - backend only accepts single status)
  // We'll filter in frontend to show only non-converted, non-lost leads
  const { data: leadsData } = useLeads({ per_page: 100 });
  const leads = (leadsData?.data || []).filter(
    (lead) => lead.lead_status !== "converted" && lead.lead_status !== "lost"
  );
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

  // Determine which schema to use based on edit mode
  const schema = isEdit ? updateVisitReportSchema : createVisitReportSchema;
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateVisitReportFormData | UpdateVisitReportFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur", // Validate on blur to avoid premature validation
    shouldUnregister: true, // Unregister fields when they're removed to prevent validation errors
    defaultValues: visitReport
      ? {
          account_id: visitReport.account_id,
          contact_id: visitReport.contact_id || undefined,
          deal_id: visitReport.deal_id || undefined,
          lead_id: visitReport.lead_id || undefined,
          visit_date: visitReport.visit_date.includes(" ") 
            ? visitReport.visit_date 
            : `${visitReport.visit_date} ${defaultVisitDateTime.time}`,
          purpose: visitReport.purpose,
          notes: visitReport.notes || "",
          // Only include status for update (edit mode) - createVisitReportSchema doesn't have status
          ...(isEdit && visitReport.status ? { status: visitReport.status as "draft" | "submitted" } : {}),
        }
      : {
          visit_date: `${new Date().toISOString().split("T")[0]} ${defaultVisitDateTime.time}`,
        },
  });

  // Reset form when dialog opens or when switching between create/edit modes
  useEffect(() => {
    if (open && !isEdit) {
      // Reset to create schema defaults (no status field) when dialog opens for create
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      reset({
        visit_date: `${now.toISOString().split("T")[0]} ${timeStr}`,
      }, { keepDefaultValues: false });
      setSelectedDate(now);
      setSelectedTime(timeStr);
    }
  }, [open, isEdit, reset]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultVisitDateTime.date);
  const [selectedTime, setSelectedTime] = useState<string | null>(defaultVisitDateTime.time);
  
  // Determine initial tab based on existing data or default to "account"
  const getInitialTab = () => {
    if (visitReport) {
      if (visitReport.deal_id) return "deal";
      if (visitReport.lead_id) return "lead";
      if (visitReport.account_id) return "account";
    }
    return "account";
  };
  
  const [activeTab, setActiveTab] = useState<"lead" | "deal" | "account">(getInitialTab());

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

  // Handle tab change - clear fields when switching tabs
  const handleTabChange = (value: string) => {
    const newTab = value as "lead" | "deal" | "account";
    setActiveTab(newTab);
    
    if (!isEdit) {
      // Clear all related fields when switching tabs
      setValue("account_id", undefined);
      setValue("contact_id", undefined);
      setValue("deal_id", undefined);
      setValue("lead_id", undefined);
    }
  };

  const handleFormSubmit = async (data: CreateVisitReportFormData | UpdateVisitReportFormData) => {
    // Business rule validation based on active tab (for create mode) or existing data (for edit mode)
    if (!isEdit) {
      // Create mode: validate based on active tab
      if (activeTab === "lead" && !data.lead_id) {
        return; // Lead is required in lead tab
      }
      if (activeTab === "deal" && !data.deal_id) {
        return; // Deal is required in deal tab
      }
      if (activeTab === "account" && !data.account_id) {
        return; // Account is required in account tab
      }
      // If DealID is provided, AccountID must be provided (auto-set from deal)
      if (data.deal_id && !data.account_id) {
        return;
      }
    } else {
      // Edit mode: Either LeadID or AccountID is required
      if (!data.account_id && !data.lead_id) {
        return;
      }
      // If DealID is provided, AccountID must be provided
      if (data.deal_id && !data.account_id) {
        return;
      }
    }
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
      {/* Tabs for selecting visit report type */}
      {!isEdit && (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t("tabs.account") || "Account"}
            </TabsTrigger>
            <TabsTrigger value="deal" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("tabs.deal") || "Deal"}
            </TabsTrigger>
            <TabsTrigger value="lead" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("tabs.lead") || "Lead"}
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 mt-4">
            <Field orientation="vertical">
              <FieldLabel>
                {t("fields.accountLabel")} *
              </FieldLabel>
              <Select
                value={watch("account_id") || undefined}
                onValueChange={(value) => setValue("account_id", value)}
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
          </TabsContent>

          {/* Deal Tab */}
          <TabsContent value="deal" className="space-y-4 mt-4">
            <Field orientation="vertical">
              <FieldLabel>
                {t("fields.dealLabel")} *
              </FieldLabel>
              <Select
                value={watch("deal_id") || undefined}
                onValueChange={(value) => {
                  setValue("deal_id", value || undefined);
                  // Auto-set account_id from deal (business rule: Deal requires Account)
                  const selectedDeal = deals.find((deal) => deal.id === value);
                  if (selectedDeal) {
                    // Deal always has account_id
                    setValue("account_id", selectedDeal.account_id);
                    // Clear contact when account changes
                    setValue("contact_id", undefined);
                  } else {
                    // Clear account_id if deal is cleared
                    setValue("account_id", undefined);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("fields.dealPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {deals
                    .filter((deal) => deal.status === "open")
                    .map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.title} {deal.account && `(${deal.account.name})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.deal_id && <FieldError>{errors.deal_id.message}</FieldError>}
            </Field>

            {watch("deal_id") && selectedAccountId && (
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
          </TabsContent>

          {/* Lead Tab */}
          <TabsContent value="lead" className="space-y-4 mt-4">
            <Field orientation="vertical">
              <FieldLabel>
                {t("fields.leadLabel")} *
              </FieldLabel>
              <Select
                value={watch("lead_id") || undefined}
                onValueChange={(value) => setValue("lead_id", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("fields.leadPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {leads.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {t("fields.noLeadsAvailable") || "No leads available"}
                    </div>
                  ) : (
                    leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.first_name} {lead.last_name} {lead.company_name && `(${lead.company_name})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.lead_id && <FieldError>{errors.lead_id.message}</FieldError>}
            </Field>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit mode - show all fields without tabs */}
      {isEdit && (
        <div className="space-y-4">
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
            <FieldLabel>{t("fields.dealLabel")}</FieldLabel>
            <Select
              value={watch("deal_id") || undefined}
              onValueChange={(value) => setValue("deal_id", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("fields.dealPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {deals
                  .filter((deal) => deal.status === "open")
                  .map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.title} {deal.account && `(${deal.account.name})`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.deal_id && <FieldError>{errors.deal_id.message}</FieldError>}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.leadLabel")}</FieldLabel>
            <Select
              value={watch("lead_id") || undefined}
              onValueChange={(value) => setValue("lead_id", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("fields.leadPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {leads.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {t("fields.noLeadsAvailable") || "No leads available"}
                  </div>
                ) : (
                  leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name} {lead.company_name && `(${lead.company_name})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.lead_id && <FieldError>{errors.lead_id.message}</FieldError>}
          </Field>
        </div>
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

