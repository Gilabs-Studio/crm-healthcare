import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(200, "Name must be at most 200 characters"),
  sku: z.string().min(1, "SKU is required").max(100, "SKU must be at most 100 characters"),
  barcode: z.string().max(100, "Barcode must be at most 100 characters").optional(),
  price: z.number().min(0, "Price must be at least 0"),
  cost: z.number().min(0, "Cost must be at least 0").optional(),
  stock: z.number().min(0, "Stock must be at least 0").optional(),
  category_id: z.string().uuid("Invalid category ID"),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  taxable: z.boolean().optional().default(true),
  description: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(200, "Name must be at most 200 characters").optional(),
  sku: z.string().min(1, "SKU is required").max(100, "SKU must be at most 100 characters").optional(),
  barcode: z.string().max(100, "Barcode must be at most 100 characters").optional(),
  price: z.number().min(0, "Price must be at least 0").optional(),
  cost: z.number().min(0, "Cost must be at least 0").optional(),
  stock: z.number().min(0, "Stock must be at least 0").optional(),
  category_id: z.string().uuid("Invalid category ID").optional(),
  status: z.enum(["active", "inactive"]).optional(),
  taxable: z.boolean().optional(),
  description: z.string().optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

