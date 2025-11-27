import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category_id: z
    .string()
    .min(1, "Category is required")
    .uuid("Invalid category ID"),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  assigned_to: z.string().uuid("Invalid user ID").optional().or(z.literal("")),
});

export const updateAccountSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  category_id: z.string().uuid("Invalid category ID").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
  assigned_to: z.string().uuid("Invalid user ID").optional().or(z.literal("")),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;

