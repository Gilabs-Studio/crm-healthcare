"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductFormData,
  type UpdateProductFormData,
} from "../schemas/product.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useProductCategories } from "../hooks/useProducts";
import type { Product } from "../types/product";

interface ProductFormProps {
  readonly product?: Product;
  readonly onSubmit: (data: CreateProductFormData | UpdateProductFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const isEdit = !!product;
  const { data: categoriesData } = useProductCategories();
  const categories = categoriesData?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductFormData | UpdateProductFormData>({
    resolver: zodResolver(isEdit ? updateProductSchema : createProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          price: product.price / 100,
          cost: product.cost / 100,
          stock: product.stock,
          category_id: product.category_id,
          status: product.status,
          taxable: product.taxable,
          description: product.description,
        }
      : {
          taxable: true,
        },
  });

  const handleFormSubmit = async (data: CreateProductFormData | UpdateProductFormData) => {
    const submitData: Record<string, unknown> = {};

    const setIfDefined = (key: keyof (CreateProductFormData & UpdateProductFormData)) => {
      const value = data[key];
      if (value !== undefined) {
        submitData[key] = value;
      }
    };

    setIfDefined("name");
    setIfDefined("sku");
    setIfDefined("barcode");
    setIfDefined("category_id");
    setIfDefined("status");
    setIfDefined("taxable");
    setIfDefined("description");

    if ("price" in data && typeof data.price === "number") {
      submitData.price = data.price;
    }

    if ("cost" in data && typeof data.cost === "number") {
      submitData.cost = data.cost;
    }

    if ("stock" in data && typeof data.stock === "number") {
      submitData.stock = data.stock;
    }

    await onSubmit(submitData as CreateProductFormData | UpdateProductFormData);
  };

  const taxable = watch("taxable");

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>Name *</FieldLabel>
        <Input {...register("name")} placeholder="Product name" />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>SKU *</FieldLabel>
          <Input {...register("sku")} placeholder="SKU code" />
          {errors.sku && <FieldError>{errors.sku.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>Barcode</FieldLabel>
          <Input {...register("barcode")} placeholder="Barcode (optional)" />
          {errors.barcode && <FieldError>{errors.barcode.message}</FieldError>}
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field orientation="vertical">
          <FieldLabel>Price (Rp) *</FieldLabel>
          <Input
            type="number"
            {...register("price", { valueAsNumber: true })}
            placeholder="0"
            min={0}
            step="0.01"
          />
          {errors.price && <FieldError>{errors.price.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>Cost (Rp)</FieldLabel>
          <Input
            type="number"
            {...register("cost", { valueAsNumber: true })}
            placeholder="0"
            min={0}
            step="0.01"
          />
          {errors.cost && <FieldError>{errors.cost.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>Stock</FieldLabel>
          <Input
            type="number"
            {...register("stock", { valueAsNumber: true })}
            placeholder="0"
            min={0}
          />
          {errors.stock && <FieldError>{errors.stock.message}</FieldError>}
        </Field>
      </div>

      <Field orientation="vertical">
        <FieldLabel>Category *</FieldLabel>
        <Select
          value={watch("category_id") || ""}
          onValueChange={(value) => setValue("category_id", value)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field orientation="horizontal" className="items-center justify-between">
          <FieldLabel>Taxable</FieldLabel>
          <Switch
            checked={!!taxable}
            onCheckedChange={(checked) => setValue("taxable", checked)}
          />
        </Field>

        <Field orientation="vertical">
          <FieldLabel>Status</FieldLabel>
          <Select
            value={watch("status") || "active"}
            onValueChange={(value) => setValue("status", value as "active" | "inactive")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <FieldError>{errors.status.message}</FieldError>}
        </Field>
      </div>

      <Field orientation="vertical">
        <FieldLabel>Description</FieldLabel>
        <Textarea {...register("description")} placeholder="Product description" rows={3} />
        {errors.description && <FieldError>{errors.description.message}</FieldError>}
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


