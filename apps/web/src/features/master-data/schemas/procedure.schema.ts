import { z } from "zod";

export const procedureSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be at most 50 characters"),
  name: z.string().min(3, "Name must be at least 3 characters").max(500, "Name must be at most 500 characters"),
  name_en: z.string().max(500, "English name must be at most 500 characters").optional(),
  category: z.string().max(100, "Category must be at most 100 characters").optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ProcedureFormData = z.infer<typeof procedureSchema>;

export const createProcedureSchema = procedureSchema;
export type CreateProcedureFormData = z.infer<typeof createProcedureSchema>;

export const updateProcedureSchema = procedureSchema.partial();
export type UpdateProcedureFormData = z.infer<typeof updateProcedureSchema>;

