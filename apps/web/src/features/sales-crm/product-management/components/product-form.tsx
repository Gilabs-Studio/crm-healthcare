"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { createProductSchema, updateProductSchema, type CreateProductFormData, type UpdateProductFormData } from "../schemas/product.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductCategories } from "../hooks/useProducts";
import type { Product } from "../types";

interface ProductFormProps {
  readonly product?: Product;
  readonly onSubmit: (data: CreateProductFormData | UpdateProductFormData) => Promise<void>;
  readonly onCancel: () => void;
  readonly isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const isEdit = !!product;
  const { data: categoriesData } = useProductCategories();
  const categories = categoriesData?.data || [];
  const t = useTranslations("productManagement.form");

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
          barcode: product.barcode || "",
          price: product.price / 100, // Convert from sen to rupiah
          cost: product.cost / 100,
          stock: product.stock,
          category_id: product.category_id,
          status: product.status,
          taxable: product.taxable,
          description: product.description || "",
        }
      : {
          status: "active",
          taxable: true,
          stock: 0,
          cost: 0,
        },
  });

  const selectedCategoryId = watch("category_id");
  const selectedStatus = watch("status");
  const selectedTaxable = watch("taxable");

  const handleFormSubmit = async (data: CreateProductFormData | UpdateProductFormData) => {
    // Convert price and cost from rupiah to sen
    const submitData: CreateProductFormData | UpdateProductFormData = {
      ...data,
      price: Math.round((data.price ?? 0) * 100),
      cost: data.cost ? Math.round(data.cost * 100) : undefined,
    };
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field orientation="vertical">
        <FieldLabel>{t("nameLabel")}</FieldLabel>
        <Input
          {...register("name")}
          placeholder={t("namePlaceholder")}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("skuLabel")}</FieldLabel>
        <Input
          {...register("sku")}
          placeholder={t("skuPlaceholder")}
          disabled={isEdit}
        />
        {errors.sku && <FieldError>{errors.sku.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("barcodeLabel")}</FieldLabel>
        <Input
          {...register("barcode")}
          placeholder={t("barcodePlaceholder")}
        />
        {errors.barcode && <FieldError>{errors.barcode.message}</FieldError>}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldLabel>{t("priceLabel")}</FieldLabel>
          <Input
            type="number"
            {...register("price", { valueAsNumber: true })}
            placeholder={t("pricePlaceholder")}
            step="0.01"
          />
          {errors.price && <FieldError>{errors.price.message}</FieldError>}
        </Field>

        <Field orientation="vertical">
          <FieldLabel>{t("costLabel")}</FieldLabel>
          <Input
            type="number"
            {...register("cost", { valueAsNumber: true })}
            placeholder={t("costPlaceholder")}
            step="0.01"
          />
          {errors.cost && <FieldError>{errors.cost.message}</FieldError>}
        </Field>
      </div>

      <Field orientation="vertical">
        <FieldLabel>{t("stockLabel")}</FieldLabel>
        <Input
          type="number"
          {...register("stock", { valueAsNumber: true })}
          placeholder={t("stockPlaceholder")}
        />
        {errors.stock && <FieldError>{errors.stock.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <FieldLabel>{t("categoryLabel")}</FieldLabel>
        <Select
          value={selectedCategoryId || ""}
          onValueChange={(value) => setValue("category_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("categoryPlaceholder")} />
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
        <FieldLabel>{t("statusLabel")}</FieldLabel>
        <Select
          value={selectedStatus || "active"}
          onValueChange={(value) => setValue("status", value as "active" | "inactive")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t("statusActive")}</SelectItem>
            <SelectItem value="inactive">{t("statusInactive")}</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <FieldError>{errors.status.message}</FieldError>}
      </Field>

      <Field orientation="vertical">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="taxable"
            checked={selectedTaxable ?? true}
            onCheckedChange={(checked) => setValue("taxable", checked === true)}
          />
          <label
            htmlFor="taxable"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("taxableLabel")}
          </label>
        </div>
        {errors.taxable && <FieldError>{errors.taxable.message}</FieldError>}
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
