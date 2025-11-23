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
import type { Diagnosis } from "../types";

interface DiagnosisFormProps {
  readonly diagnosis?: Diagnosis;
  readonly onSubmit: (data: CreateDiagnosisFormData | UpdateDiagnosisFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function DiagnosisForm({ diagnosis, onSubmit, onCancel, isLoading }: DiagnosisFormProps) {
  const isEdit = !!diagnosis;

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
          name_en: diagnosis.name_en,
          category: diagnosis.category,
          description: diagnosis.description,
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
        <FieldLabel>Name (Indonesian)</FieldLabel>
        <Input
          {...register("name")}
          placeholder="Diagnosis name in Indonesian"
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Name (English) - Optional</FieldLabel>
        <Input
          {...register("name_en")}
          placeholder="Diagnosis name in English"
        />
        {errors.name_en && <FieldError>{errors.name_en.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>Category - Optional</FieldLabel>
        <Input
          {...register("category")}
          placeholder="Category"
        />
        {errors.category && <FieldError>{errors.category.message}</FieldError>}
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

