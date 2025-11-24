"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountFormData,
  type UpdateAccountFormData,
} from "../schemas/account.schema";
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
import type { Account } from "../types";

interface AccountFormProps {
  readonly account?: Account;
  readonly onSubmit: (data: CreateAccountFormData | UpdateAccountFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function AccountForm({ account, onSubmit, onCancel, isLoading }: AccountFormProps) {
  const isEdit = !!account;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAccountFormData | UpdateAccountFormData>({
    resolver: zodResolver(isEdit ? updateAccountSchema : createAccountSchema),
    defaultValues: account
      ? {
          name: account.name,
          category: account.category,
          address: account.address || "",
          city: account.city || "",
          province: account.province || "",
          phone: account.phone || "",
          email: account.email || "",
          status: account.status,
          assigned_to: account.assigned_to || "",
        }
      : {
          status: "active",
        },
  });

  const handleFormSubmit = async (data: CreateAccountFormData | UpdateAccountFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>Name *</FieldLabel>
        <Input {...register("name")} placeholder="Account Name" />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Category *</FieldLabel>
        <Select
          value={watch("category") || ""}
          onValueChange={(value) => setValue("category", value as "hospital" | "clinic" | "pharmacy")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hospital">Hospital</SelectItem>
            <SelectItem value="clinic">Clinic</SelectItem>
            <SelectItem value="pharmacy">Pharmacy</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <FieldError>{errors.category.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Address</FieldLabel>
        <Textarea {...register("address")} placeholder="Full address" rows={3} />
        {errors.address && <FieldError>{errors.address.message}</FieldError>}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>City</FieldLabel>
          <Input {...register("city")} placeholder="City" />
          {errors.city && <FieldError>{errors.city.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>Province</FieldLabel>
          <Input {...register("province")} placeholder="Province" />
          {errors.province && <FieldError>{errors.province.message}</FieldError>}
        </Field>
      </div>

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
        <FieldLabel>Status</FieldLabel>
        <Select
          value={watch("status") || "active"}
          onValueChange={(value) => setValue("status", value as "active" | "inactive")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
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

