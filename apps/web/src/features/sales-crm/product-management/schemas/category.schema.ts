import { z } from "zod";

export const createProductCategorySchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, "Name must be at least 3 characters"),
  slug: z
    .string()
    .max(150, "Slug must be at most 150 characters")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateProductCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  slug: z.string().max(150, "Slug must be at most 150 characters").optional().or(z.literal("")),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateProductCategoryFormData = z.infer<typeof createProductCategorySchema>;
export type UpdateProductCategoryFormData = z.infer<typeof updateProductCategorySchema>;


