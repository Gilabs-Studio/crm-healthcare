import { z } from "zod";

export const diagnosisSchema = z.object({
  code: z.string().min(1, "Code is required").max(20, "Code must be at most 20 characters"),
  name: z.string().min(3, "Name must be at least 3 characters").max(500, "Name must be at most 500 characters"),
  name_en: z.string().max(500, "English name must be at most 500 characters").optional(),
  category: z.string().max(100, "Category must be at most 100 characters").optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;

export const createDiagnosisSchema = diagnosisSchema;
export type CreateDiagnosisFormData = z.infer<typeof createDiagnosisSchema>;

export const updateDiagnosisSchema = diagnosisSchema.partial();
export type UpdateDiagnosisFormData = z.infer<typeof updateDiagnosisSchema>;

