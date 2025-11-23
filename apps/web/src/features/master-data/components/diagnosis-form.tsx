"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDiagnosisSchema,
  updateDiagnosisSchema,
  type CreateDiagnosisFormData,
  type UpdateDiagnosisFormData,
} from "../schemas/diagnosis.schema";
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
import type { Diagnosis } from "../types";

interface DiagnosisFormProps {
  readonly diagnosis?: Diagnosis;
  readonly onSubmit: (data: CreateDiagnosisFormData | UpdateDiagnosisFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function DiagnosisForm({ diagnosis, onSubmit, onCancel, isLoading }: DiagnosisFormProps) {
  const isEdit = !!diagnosis;

  // Fetch categories for diagnosis
  const { data: categoriesData } = useCategories({
    type: "diagnosis",
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
  } = useForm<CreateDiagnosisFormData | UpdateDiagnosisFormData>({
    resolver: zodResolver(isEdit ? updateDiagnosisSchema : createDiagnosisSchema),
    defaultValues: diagnosis
      ? {
          code: diagnosis.code,
          name: diagnosis.name,
          category_id: diagnosis.category_id || null,
          description: diagnosis.description || null,
          status: diagnosis.status,
        }
      : {
          status: "active",
        },
  });

  const handleFormSubmit = async (data: CreateDiagnosisFormData | UpdateDiagnosisFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>Code (ICD-10)</FieldLabel>
        <Input
          {...register("code")}
          placeholder="A00.0"
          disabled={isEdit}
        />
        {errors.code && <FieldError>{errors.code.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Name</FieldLabel>
        <Input
          {...register("name")}
          placeholder="Diagnosis name"
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
