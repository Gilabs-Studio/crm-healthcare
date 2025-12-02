"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { createActivitySchema, type CreateActivityFormData } from "../schemas/activity.schema";
import { useCreateActivity } from "../hooks/useVisitReports";
import { useActivityTypes } from "../hooks/useActivityTypes";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateActivityDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly accountId?: string;
  readonly contactId?: string;
  readonly onSuccess?: () => void;
}

export function CreateActivityDialog({
  open,
  onOpenChange,
  accountId,
  contactId,
  onSuccess,
}: CreateActivityDialogProps) {
  const createActivity = useCreateActivity();
  const { data: activityTypesData, isLoading: isLoadingTypes } = useActivityTypes({ status: "active" });

  const activityTypes = useMemo(() => {
    return activityTypesData?.data ?? [];
  }, [activityTypesData]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateActivityFormData>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      activity_type_id: "",
      account_id: accountId,
      contact_id: contactId,
      description: "",
      timestamp: new Date().toISOString(),
    },
  });

  // Update form values when accountId/contactId changes or dialog opens
  useEffect(() => {
    if (open) {
      // Set default activity type to first available type if exists
      const defaultTypeId = activityTypes.length > 0 ? activityTypes[0]?.id : "";
      reset({
        activity_type_id: defaultTypeId,
        account_id: accountId,
        contact_id: contactId,
        description: "",
        timestamp: new Date().toISOString(),
      });
    }
  }, [open, accountId, contactId, reset, activityTypes]);

  // Warn if accountId is missing (should not happen when called from visit report)
  useEffect(() => {
    if (open && !accountId) {
      console.warn("CreateActivityDialog: accountId is missing. Activity may not appear in timeline.");
    }
  }, [open, accountId]);

  const onSubmit = async (data: CreateActivityFormData) => {
    try {
      // CRITICAL: Always use accountId from props (from visit report)
      // This ensures activity is linked to the correct account
      // Without account_id, activity won't appear in timeline
      const finalAccountId = accountId || data.account_id;
      const finalContactId = contactId || data.contact_id;

      if (!finalAccountId) {
        toast.error("Account ID is required. Please ensure visit report has an account.");
        return;
      }

      // Prepare request payload
      const payload: {
        activity_type_id: string;
        account_id: string;
        contact_id?: string;
        description: string;
        timestamp: string;
        metadata?: Record<string, unknown>;
      } = {
        activity_type_id: data.activity_type_id,
        account_id: finalAccountId, // Always include account_id
        description: data.description,
        timestamp: data.timestamp,
        metadata: {},
      };

      // Include contact_id if available
      if (finalContactId) {
        payload.contact_id = finalContactId;
      }

      await createActivity.mutateAsync(payload);
      toast.success("Activity created successfully");
      const defaultTypeId = activityTypes.length > 0 ? activityTypes[0]?.id : "";
      reset({
        activity_type_id: defaultTypeId,
        account_id: accountId,
        contact_id: contactId,
        description: "",
        timestamp: new Date().toISOString(),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error already handled in api-client interceptor
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field orientation="vertical">
            <FieldLabel>Activity Type *</FieldLabel>
            {isLoadingTypes ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={watch("activity_type_id") ?? ""}
                onValueChange={(value) => setValue("activity_type_id", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No activity types available
                    </div>
                  ) : (
                    activityTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {errors.activity_type_id && <FieldError>{errors.activity_type_id.message}</FieldError>}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Description *</FieldLabel>
            <Textarea
              {...register("description")}
              placeholder="Describe the activity"
              rows={4}
            />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Date & Time *</FieldLabel>
            <Input
              type="datetime-local"
              value={
                watch("timestamp")
                  ? new Date(watch("timestamp")).toISOString().slice(0, 16)
                  : new Date().toISOString().slice(0, 16)
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  const date = new Date(value);
                  setValue("timestamp", date.toISOString(), { shouldValidate: true });
                }
              }}
            />
            {errors.timestamp && <FieldError>{errors.timestamp.message}</FieldError>}
          </Field>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={createActivity.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createActivity.isPending}>
              {createActivity.isPending ? "Creating..." : "Create Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

