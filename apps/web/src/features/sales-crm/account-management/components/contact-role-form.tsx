"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { createContactRoleSchema, updateContactRoleSchema, type CreateContactRoleFormData, type UpdateContactRoleFormData } from "../schemas/contact-role.schema";
import type { ContactRole } from "../types";

interface ContactRoleFormProps {
  readonly contactRole?: ContactRole;
  readonly onSubmit: (data: CreateContactRoleFormData | UpdateContactRoleFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function ContactRoleForm({ contactRole, onSubmit, onCancel, isLoading = false }: ContactRoleFormProps) {
  const isEdit = !!contactRole;
  const schema = isEdit ? updateContactRoleSchema : createContactRoleSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateContactRoleFormData | UpdateContactRoleFormData>({
    resolver: zodResolver(schema),
    defaultValues: contactRole
      ? {
          name: contactRole.name,
          code: contactRole.code,
          description: contactRole.description || "",
          badge_color: contactRole.badge_color,
          status: contactRole.status,
        }
      : {
          badge_color: "outline",
          status: "active",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter contact role name"
          disabled={isLoading}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="code">Code</FieldLabel>
        <Input
          id="code"
          {...register("code")}
          placeholder="Enter contact role code (e.g., DOCTOR, PIC, MANAGER)"
          disabled={isLoading || isEdit}
        />
        {isEdit && (
          <p className="text-xs text-muted-foreground mt-1">
            Code cannot be changed after creation
          </p>
        )}
        {errors.code && <FieldError>{errors.code.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Input
          id="description"
          {...register("description")}
          placeholder="Enter contact role description (optional)"
          disabled={isLoading}
        />
        {errors.description && <FieldError>{errors.description.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="badge_color">Badge Color</FieldLabel>
        <select
          id="badge_color"
          {...register("badge_color")}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="default">Default</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="active">Active</option>
        </select>
        {errors.badge_color && <FieldError>{errors.badge_color.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="status">Status</FieldLabel>
        <select
          id="status"
          {...register("status")}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {errors.status && <FieldError>{errors.status.message}</FieldError>}
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

