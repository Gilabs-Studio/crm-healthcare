import { z } from "zod";

export const procedureSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be at most 50 characters"),
  name: z.string().min(3, "Name must be at least 3 characters").max(500, "Name must be at most 500 characters"),
  category_id: z.string().uuid("Category ID must be a valid UUID").optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().min(0, "Price must be non-negative").optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ProcedureFormData = z.infer<typeof procedureSchema>;

export const createProcedureSchema = procedureSchema;
export type CreateProcedureFormData = z.infer<typeof createProcedureSchema>;

export const updateProcedureSchema = procedureSchema.partial();
export type UpdateProcedureFormData = z.infer<typeof updateProcedureSchema>;

