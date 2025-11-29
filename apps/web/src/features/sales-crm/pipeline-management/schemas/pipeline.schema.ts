import { z } from "zod";

export const createStageSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters"),
  code: z.string().min(1, "Code is required").max(50, "Code must be at most 50 characters"),
  order: z.number().min(0, "Order must be greater than or equal to 0"),
  color: z.string().max(20, "Color must be at most 20 characters").optional(),
  is_active: z.boolean().optional().default(true),
  is_won: z.boolean().optional().default(false),
  is_lost: z.boolean().optional().default(false),
  description: z.string().optional(),
});

export const updateStageSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters").optional(),
  code: z.string().min(1, "Code is required").max(50, "Code must be at most 50 characters").optional(),
  order: z.number().min(0, "Order must be greater than or equal to 0").optional(),
  color: z.string().max(20, "Color must be at most 20 characters").optional(),
  is_active: z.boolean().optional(),
  is_won: z.boolean().optional(),
  is_lost: z.boolean().optional(),
  description: z.string().optional(),
});

export const updateStagesOrderSchema = z.object({
  stages: z
    .array(
      z.object({
        id: z.string().uuid("Invalid stage ID"),
        order: z.number().min(0, "Order must be greater than or equal to 0"),
      })
    )
    .min(1, "At least one stage is required"),
});

export type CreateStageFormData = z.infer<typeof createStageSchema>;
export type UpdateStageFormData = z.infer<typeof updateStageSchema>;
export type UpdateStagesOrderFormData = z.infer<typeof updateStagesOrderSchema>;

