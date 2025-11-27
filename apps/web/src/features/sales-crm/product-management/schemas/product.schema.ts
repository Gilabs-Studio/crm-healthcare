import { z } from "zod";
import type { ProductStatus } from "../types/product";

export const productStatusValues: ProductStatus[] = ["active", "inactive"];

export const createProductSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, "Name must be at least 3 characters")
    .max(200, "Name must be at most 200 characters"),
  sku: z
    .string({
      required_error: "SKU is required",
    })
    .min(1, "SKU is required")
    .max(100, "SKU must be at most 100 characters"),
  barcode: z.string().max(100, "Barcode must be at most 100 characters").optional().or(z.literal("")),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .min(0, "Price cannot be negative"),
  cost: z
    .number({
      invalid_type_error: "Cost must be a number",
    })
    .min(0, "Cost cannot be negative")
    .optional(),
  stock: z
    .number({
      invalid_type_error: "Stock must be a number",
    })
    .min(0, "Stock cannot be negative")
    .optional(),
  category_id: z
    .string({
      required_error: "Category is required",
    })
    .uuid("Invalid category ID"),
  status: z.enum(productStatusValues).default("active").optional(),
  taxable: z.boolean().optional(),
  description: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(200, "Name must be at most 200 characters")
    .optional(),
  sku: z.string().min(1, "SKU is required").max(100, "SKU must be at most 100 characters").optional(),
  barcode: z.string().max(100, "Barcode must be at most 100 characters").optional().or(z.literal("")),
  price: z
    .number({
      invalid_type_error: "Price must be a number",
    })
    .min(0, "Price cannot be negative")
    .optional(),
  cost: z
    .number({
      invalid_type_error: "Cost must be a number",
    })
    .min(0, "Cost cannot be negative")
    .optional(),
  stock: z
    .number({
      invalid_type_error: "Stock must be a number",
    })
    .min(0, "Stock cannot be negative")
    .optional(),
  category_id: z.string().uuid("Invalid category ID").optional(),
  status: z.enum(productStatusValues).optional(),
  taxable: z.boolean().optional(),
  description: z.string().optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;


