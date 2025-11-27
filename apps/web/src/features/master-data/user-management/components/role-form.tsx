"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { createRoleSchema, updateRoleSchema, type CreateRoleFormData, type UpdateRoleFormData } from "../schemas/role.schema";
import type { Role } from "../types";

interface RoleFormProps {
  readonly role?: Role;
  readonly onSubmit: (data: CreateRoleFormData | UpdateRoleFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function RoleForm({ role, onSubmit, onCancel, isLoading = false }: RoleFormProps) {
  const isEdit = !!role;
  const schema = isEdit ? updateRoleSchema : createRoleSchema;
  const t = useTranslations("userManagement.roleForm");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleFormData | UpdateRoleFormData>({
    resolver: zodResolver(schema),
    defaultValues: role
      ? {
          name: role.name,
          code: role.code,
          description: role.description || "",
          status: role.status,
        }
      : {
          status: "active",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="name">{t("nameLabel")}</FieldLabel>
        <Input
          id="name"
          {...register("name")}
          placeholder={t("namePlaceholder")}
          disabled={isLoading}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="code">{t("codeLabel")}</FieldLabel>
        <Input
          id="code"
          {...register("code")}
          placeholder={t("codePlaceholder")}
          disabled={isLoading || isEdit}
        />
        {isEdit && (
          <p className="text-xs text-muted-foreground mt-1">
            {t("codeHint")}
          </p>
        )}
        {errors.code && <FieldError>{errors.code.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="description">{t("descriptionLabel")}</FieldLabel>
        <Input
          id="description"
          {...register("description")}
          placeholder={t("descriptionPlaceholder")}
          disabled={isLoading}
        />
        {errors.description && <FieldError>{errors.description.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="status">{t("statusLabel")}</FieldLabel>
        <select
          id="status"
          {...register("status")}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="active">{t("statusActive")}</option>
          <option value="inactive">{t("statusInactive")}</option>
        </select>
        {errors.status && <FieldError>{errors.status.message}</FieldError>}
      </Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? t("submitting")
            : isEdit
              ? t("submitUpdate")
              : t("submitCreate")}
        </Button>
      </div>
    </form>
  );
}

