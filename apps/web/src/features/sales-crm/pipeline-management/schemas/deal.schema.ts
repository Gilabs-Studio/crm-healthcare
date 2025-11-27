import { z } from "zod";

export const createDealSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must be at most 255 characters"),
  description: z.string().optional(),
  account_id: z
    .string()
    .min(1, "Account is required")
    .uuid("Invalid account ID"),
  contact_id: z.string().uuid("Invalid contact ID").optional().or(z.literal("")),
  stage_id: z
    .string()
    .min(1, "Stage is required")
    .uuid("Invalid stage ID"),
  value: z.number().min(0, "Value must be greater than or equal to 0"),
  probability: z.number().min(0, "Probability must be between 0 and 100").max(100, "Probability must be between 0 and 100").optional().default(0),
  expected_close_date: z.string().optional().or(z.literal("")),
  assigned_to: z.string().uuid("Invalid user ID").optional().or(z.literal("")),
  source: z.string().max(100, "Source must be at most 100 characters").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const updateDealSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must be at most 255 characters").optional(),
  description: z.string().optional(),
  account_id: z.string().uuid("Invalid account ID").optional(),
  contact_id: z.string().uuid("Invalid contact ID").optional().or(z.literal("")),
  stage_id: z.string().uuid("Invalid stage ID").optional(),
  value: z.number().min(0, "Value must be greater than or equal to 0").optional(),
  probability: z.number().min(0, "Probability must be between 0 and 100").max(100, "Probability must be between 0 and 100").optional(),
  expected_close_date: z.string().optional().or(z.literal("")),
  assigned_to: z.string().uuid("Invalid user ID").optional().or(z.literal("")),
  status: z.enum(["open", "won", "lost"]).optional(),
  source: z.string().max(100, "Source must be at most 100 characters").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const moveDealSchema = z.object({
  stage_id: z
    .string()
    .min(1, "Stage is required")
    .uuid("Invalid stage ID"),
});

export type CreateDealFormData = z.infer<typeof createDealSchema>;
export type UpdateDealFormData = z.infer<typeof updateDealSchema>;
export type MoveDealFormData = z.infer<typeof moveDealSchema>;

