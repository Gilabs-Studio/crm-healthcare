"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createContactSchema,
  updateContactSchema,
  type CreateContactFormData,
  type UpdateContactFormData,
} from "../schemas/contact.schema";
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
import { useAccounts } from "../hooks/useAccounts";
import { useContactRoles } from "../hooks/useContactRoles";
import type { Contact } from "../types";

interface ContactFormProps {
  readonly contact?: Contact;
  readonly onSubmit: (data: CreateContactFormData | UpdateContactFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
  readonly defaultAccountId?: string;
}

export function ContactForm({
  contact,
  onSubmit,
  onCancel,
  isLoading,
  defaultAccountId,
}: ContactFormProps) {
  const isEdit = !!contact;
  const { data: accountsData } = useAccounts({ per_page: 100 });
  const accounts = accountsData?.data || [];
  const { data: contactRolesData } = useContactRoles();
  const contactRoles = contactRolesData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateContactFormData | UpdateContactFormData>({
    resolver: zodResolver(isEdit ? updateContactSchema : createContactSchema),
    defaultValues: contact
      ? {
          account_id: contact.account_id,
          name: contact.name,
          role_id: contact.role_id,
          phone: contact.phone || "",
          email: contact.email || "",
          position: contact.position || "",
          notes: contact.notes || "",
        }
      : {
          account_id: defaultAccountId || "",
        },
  });

  const selectedAccountId = watch("account_id");

  const handleFormSubmit = async (data: CreateContactFormData | UpdateContactFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>Account *</FieldLabel>
        <Select
          value={selectedAccountId || ""}
          onValueChange={(value) => setValue("account_id", value)}
          disabled={isEdit}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} {account.category && `(${account.category.name})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.account_id && <FieldError>{errors.account_id.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Name *</FieldLabel>
        <Input {...register("name")} placeholder="Contact Name" />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Role *</FieldLabel>
        <Select
          value={watch("role_id") || ""}
          onValueChange={(value) => setValue("role_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {contactRoles
              .filter((role) => role.status === "active")
              .map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.role_id && <FieldError>{errors.role_id.message}</FieldError>}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>Phone</FieldLabel>
          <Input {...register("phone")} placeholder="Phone number" />
          {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>Email</FieldLabel>
          <Input type="email" {...register("email")} placeholder="email@example.com" />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>
      </div>

      <Field orientation="vertical">
        <FieldLabel>Position</FieldLabel>
        <Input {...register("position")} placeholder="Position/Title" />
        {errors.position && <FieldError>{errors.position.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Notes</FieldLabel>
        <Textarea {...register("notes")} placeholder="Additional notes" rows={3} />
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

