"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskFormData,
  type UpdateTaskFormData,
  taskPriorityValues,
  taskStatusValues,
  taskTypeValues,
} from "../schemas/task.schema";
import type { Task } from "../types";
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
import { useAccounts } from "@/features/sales-crm/account-management/hooks/useAccounts";
import { useContacts } from "@/features/sales-crm/account-management/hooks/useContacts";
import { useUsers } from "@/features/master-data/user-management/hooks/useUsers";
import { useTranslations } from "next-intl";

interface TaskFormProps {
  readonly task?: Task;
  readonly onSubmit: (data: CreateTaskFormData | UpdateTaskFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const isEdit = !!task;
  const t = useTranslations("taskManagement.form");

  const { data: accountsData } = useAccounts({ status: "active", per_page: 100 });
  const accounts = accountsData?.data ?? [];

  const { data: usersData } = useUsers({ status: "active", per_page: 100 });
  const users = usersData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskFormData | UpdateTaskFormData>({
    resolver: zodResolver(isEdit ? updateTaskSchema : createTaskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          status: task.status,
          due_date: task.due_date ? task.due_date.split("T")[0] : "",
          assigned_to: task.assigned_to || "",
          account_id: task.account_id || "",
          contact_id: task.contact_id || "",
          deal_id: task.deal_id || "",
        }
      : {
          type: "general",
          priority: "medium",
        },
  });

  const accountId = watch("account_id") as string | undefined;

  const { data: contactsData } = useContacts({
    account_id: accountId || task?.account_id,
    per_page: 100,
  });
  const contacts = contactsData?.data ?? [];

  useEffect(() => {
    if (!isEdit && accountId && accountId !== (task as { account_id?: string } | undefined)?.account_id) {
      setValue("contact_id", "");
    }
  }, [accountId, isEdit, task, setValue]);

  const handleFormSubmit = async (data: CreateTaskFormData | UpdateTaskFormData) => {
    const submitData: Record<string, unknown> = {};

    const isValidValue = (value: unknown): boolean => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") {
        return value.trim() !== "" && value !== "none";
      }
      return true;
    };

    if (isValidValue(data.title)) {
      submitData.title = data.title;
    }

    if (isValidValue(data.description)) {
      submitData.description = data.description;
    }

    if (isValidValue(data.type)) {
      submitData.type = data.type;
    }

    if (!isEdit && isValidValue(data.priority)) {
      submitData.priority = data.priority;
    } else if (isEdit && "priority" in data && isValidValue(data.priority)) {
      submitData.priority = data.priority;
    }

    if (isEdit && "status" in data && isValidValue(data.status)) {
      submitData.status = data.status;
    }

    if (isValidValue(data.due_date)) {
      const dateStr = data.due_date as string;
      const date = new Date(dateStr);
      if (!Number.isNaN(date.getTime())) {
        submitData.due_date = date.toISOString();
      }
    }

    if (isValidValue(data.assigned_to)) {
      submitData.assigned_to = data.assigned_to;
    }

    if (isValidValue(data.account_id)) {
      submitData.account_id = data.account_id;
    }

    if (isValidValue(data.contact_id)) {
      submitData.contact_id = data.contact_id;
    }

    if (isValidValue(data.deal_id)) {
      submitData.deal_id = data.deal_id;
    }

    if (isEdit && Object.keys(submitData).length === 0) {
      return;
    }

    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === undefined || submitData[key] === null) {
        delete submitData[key];
      }
    });

    await onSubmit(submitData as CreateTaskFormData | UpdateTaskFormData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>{t("titleLabel")} *</FieldLabel>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field orientation="vertical">
          <FieldLabel>{t("typeLabel")}</FieldLabel>
          <Select
            value={(watch("type") as string | undefined) ?? "general"}
            onValueChange={(value) => setValue("type", value as (typeof taskTypeValues)[number])}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {taskTypeValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <FieldError>{errors.type.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("priorityLabel")}</FieldLabel>
          <Select
            value={(watch("priority") as string | undefined) ?? "medium"}
            onValueChange={(value) =>
              setValue("priority", value as (typeof taskPriorityValues)[number])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("priorityPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {taskPriorityValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priority && <FieldError>{errors.priority.message}</FieldError>}
        </Field>

        {isEdit && (
          <Field orientation="vertical">
            <FieldLabel>{t("statusLabel")}</FieldLabel>
            <Select
              value={(watch("status") as string | undefined) ?? task?.status ?? "pending"}
              onValueChange={(value) =>
                setValue("status", value as (typeof taskStatusValues)[number])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {taskStatusValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <FieldError>{errors.status.message}</FieldError>}
          </Field>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>{t("dueDateLabel")}</FieldLabel>
          <Input type="date" {...register("due_date")} />
          {errors.due_date && <FieldError>{errors.due_date.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("assignedToLabel")}</FieldLabel>
          <Select
            value={(watch("assigned_to") as string | undefined) ?? ""}
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
      </div>

      <Field orientation="vertical">
        <FieldLabel>{t("accountLabel")}</FieldLabel>
        <Select
          value={(watch("account_id") as string | undefined) ?? ""}
          onValueChange={(value) => setValue("account_id", value === "none" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("accountPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("accountNone")}</SelectItem>
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
          value={(watch("contact_id") as string | undefined) ?? ""}
          onValueChange={(value) => setValue("contact_id", value === "none" ? "" : value)}
          disabled={!watch("account_id") && !task?.account_id}
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


