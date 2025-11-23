"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProcedureSchema,
  updateProcedureSchema,
  type CreateProcedureFormData,
  type UpdateProcedureFormData,
} from "../schemas/procedure.schema";
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
import { useCategories } from "../hooks/useCategories";
import type { Procedure } from "../types";

interface ProcedureFormProps {
  readonly procedure?: Procedure;
  readonly onSubmit: (data: CreateProcedureFormData | UpdateProcedureFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function ProcedureForm({ procedure, onSubmit, onCancel, isLoading }: ProcedureFormProps) {
  const isEdit = !!procedure;

  // Fetch categories for procedure
  const { data: categoriesData } = useCategories({
    type: "procedure",
    status: "active",
    per_page: 100,
  });
  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProcedureFormData | UpdateProcedureFormData>({
    resolver: zodResolver(isEdit ? updateProcedureSchema : createProcedureSchema),
    defaultValues: procedure
      ? {
          code: procedure.code,
          name: procedure.name,
          category_id: procedure.category_id || null,
          description: procedure.description || null,
          price: procedure.price || null,
          status: procedure.status,
        }
      : {
          status: "active",
        },
  });

  const handleFormSubmit = async (data: CreateProcedureFormData | UpdateProcedureFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>Code</FieldLabel>
        <Input
          {...register("code")}
          placeholder="PROC-001"
          disabled={isEdit}
        />
        {errors.code && <FieldError>{errors.code.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Name</FieldLabel>
        <Input
          {...register("name")}
          placeholder="Procedure name"
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Category - Optional</FieldLabel>
        <Select
          value={watch("category_id") || undefined}
          onValueChange={(value) => setValue("category_id", value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category_id && <FieldError>{errors.category_id.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Price (Rupiah) - Optional</FieldLabel>
        <Input
          type="number"
          {...register("price", { valueAsNumber: true })}
          placeholder="0"
          min={0}
        />
        {errors.price && <FieldError>{errors.price.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Description - Optional</FieldLabel>
        <Textarea
          {...register("description")}
          placeholder="Description"
          rows={4}
        />
        {errors.description && <FieldError>{errors.description.message}</FieldError>}
      </Field>

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
