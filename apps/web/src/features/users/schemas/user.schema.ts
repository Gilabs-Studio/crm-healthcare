import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["active", "inactive"]).optional(),
  role_ids: z.array(z.string()).optional(),
  permission_ids: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const updateUserPermissionsSchema = z.object({
  role_ids: z.array(z.string()).optional(),
  permission_ids: z.array(z.string()).optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type UpdateUserPermissionsFormData = z.infer<typeof updateUserPermissionsSchema>;

