"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { convertLeadSchema, type ConvertLeadFormData } from "../schemas/lead.schema";
import { useConvertLead } from "../hooks/useLeads";
import { usePipelines } from "../../pipeline-management/hooks/usePipelines";
import { useAccounts } from "../../account-management/hooks/useAccounts";
import { useContacts } from "../../account-management/hooks/useContacts";
import type { Lead } from "../types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface ConvertLeadDialogProps {
  readonly lead: Lead;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
}

export function ConvertLeadDialog({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: ConvertLeadDialogProps) {
  const t = useTranslations("leadManagement.convertLead");
  const convertLead = useConvertLead();
  
  // Initialize form first before using watch
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConvertLeadFormData>({
    resolver: zodResolver(convertLeadSchema),
    defaultValues: {
      create_account: false,
      create_contact: false,
    },
  });

  const { data: pipelinesData, isLoading: isLoadingStages } = usePipelines({ is_active: true });
  const stages = pipelinesData?.data ?? [];

  const { data: accountsData } = useAccounts({ per_page: 100 });
  const accounts = accountsData?.data ?? [];

  const selectedAccountId = watch("account_id") || "";
  const { data: contactsData } = useContacts({
    account_id: selectedAccountId,
    per_page: 100,
  });
  const contacts = contactsData?.data ?? [];

  useEffect(() => {
    if (open) {
      reset({
        opportunity_title: `${lead.company_name || lead.first_name} - Opportunity`,
        create_account: false,
        create_contact: false,
      });
    }
  }, [open, lead, reset]);

  const onSubmit = async (data: ConvertLeadFormData) => {
    try {
      await convertLead.mutateAsync({ id: lead.id, data });
      toast.success(t("toast.success"));
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error already handled in api-client interceptor
    }
  };

  const selectedAccountIdValue = watch("account_id");
  const selectedStageId = watch("stage_id");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field orientation="vertical">
            <FieldLabel>
              {t("fields.opportunityTitle")} *
            </FieldLabel>
            <Input
              {...register("opportunity_title")}
              placeholder={t("fields.opportunityTitlePlaceholder")}
            />
            {errors.opportunity_title && (
              <FieldError>{errors.opportunity_title.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.opportunityDescription")}</FieldLabel>
            <Textarea
              {...register("opportunity_description")}
              placeholder={t("fields.opportunityDescriptionPlaceholder")}
              rows={3}
            />
            {errors.opportunity_description && (
              <FieldError>{errors.opportunity_description.message}</FieldError>
            )}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>
              {t("fields.stage")} *
            </FieldLabel>
            {isLoadingStages ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedStageId || undefined}
                onValueChange={(value) => setValue("stage_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("fields.stagePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {stages.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No pipeline stages available
                    </div>
                  ) : (
                    stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {errors.stage_id && <FieldError>{errors.stage_id.message}</FieldError>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field orientation="vertical">
              <FieldLabel>{t("fields.value")}</FieldLabel>
              <NumberInput
                value={watch("value") ?? undefined}
                onChange={(value) => setValue("value", value ?? undefined)}
                allowDecimal={false}
                placeholder="0"
              />
              {errors.value && <FieldError>{errors.value.message}</FieldError>}
            </Field>

            <Field orientation="vertical">
              <FieldLabel>{t("fields.probability")}</FieldLabel>
              <NumberInput
                value={watch("probability") ?? undefined}
                onChange={(value) => {
                  // Ensure value is between 0 and 100
                  const clampedValue = value !== undefined ? Math.min(100, Math.max(0, value)) : undefined;
                  setValue("probability", clampedValue);
                }}
                allowDecimal={false}
                placeholder="0-100"
              />
              {errors.probability && (
                <FieldError>{errors.probability.message}</FieldError>
              )}
            </Field>
          </div>

          <Field orientation="vertical">
            <FieldLabel>{t("fields.expectedCloseDate")}</FieldLabel>
            <DatePicker
              value={watch("expected_close_date") ? new Date(watch("expected_close_date")!) : undefined}
              onDateChange={(date) =>
                setValue("expected_close_date", date ? date.toISOString() : undefined)
              }
            />
            {errors.expected_close_date && (
              <FieldError>{errors.expected_close_date.message}</FieldError>
            )}
          </Field>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create_account"
                checked={watch("create_account") || false}
                onCheckedChange={(checked) => {
                  setValue("create_account", checked === true);
                }}
              />
              <label
                htmlFor="create_account"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("fields.createAccount")}
              </label>
            </div>

            {!watch("create_account") && (
              <Field orientation="vertical">
                <FieldLabel>{t("fields.existingAccount")}</FieldLabel>
                <Select
                  value={watch("account_id") || undefined}
                  onValueChange={(value) => setValue("account_id", value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("fields.accountPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.account_id && (
                  <FieldError>{errors.account_id.message}</FieldError>
                )}
              </Field>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="create_contact"
                checked={watch("create_contact") || false}
                onCheckedChange={(checked) => {
                  setValue("create_contact", checked === true);
                }}
              />
              <label
                htmlFor="create_contact"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("fields.createContact")}
              </label>
            </div>

            {!watch("create_contact") && watch("account_id") && (
              <Field orientation="vertical">
                <FieldLabel>{t("fields.existingContact")}</FieldLabel>
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
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contact_id && (
                  <FieldError>{errors.contact_id.message}</FieldError>
                )}
              </Field>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={convertLead.isPending}
            >
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={convertLead.isPending}>
              {convertLead.isPending ? t("buttons.converting") : t("buttons.convert")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

