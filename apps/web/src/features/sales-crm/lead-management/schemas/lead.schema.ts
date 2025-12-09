import { z } from "zod";

export const createLeadSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100, "First name must be at most 100 characters"),
  last_name: z.string().max(100, "Last name must be at most 100 characters").optional(),
  company_name: z.string().max(255, "Company name must be at most 255 characters").optional(),
  email: z.string().email("Invalid email address").max(255, "Email must be at most 255 characters"),
  phone: z.string().max(20, "Phone must be at most 20 characters").optional(),
  job_title: z.string().max(100, "Job title must be at most 100 characters").optional(),
  industry: z.string().max(100, "Industry must be at most 100 characters").optional(),
  lead_source: z.string().min(1, "Lead source is required").max(100, "Lead source must be at most 100 characters"),
  lead_status: z.enum(["new", "contacted", "qualified", "unqualified", "nurturing", "disqualified", "converted", "lost"]).optional(),
  lead_score: z.number().int().min(0).max(100).optional(),
  assigned_to: z.string().uuid("Invalid user ID").optional(),
  notes: z.string().optional(),
  address: z.string().optional(),
  city: z.string().max(100, "City must be at most 100 characters").optional(),
  province: z.string().max(100, "Province must be at most 100 characters").optional(),
  postal_code: z.string().max(20, "Postal code must be at most 20 characters").optional(),
  country: z.string().max(100, "Country must be at most 100 characters").optional(),
  website: z.string().url("Invalid website URL").max(255, "Website must be at most 255 characters").optional().or(z.literal("")),
});

export const updateLeadSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100, "First name must be at most 100 characters").optional(),
  last_name: z.string().max(100, "Last name must be at most 100 characters").optional(),
  company_name: z.string().max(255, "Company name must be at most 255 characters").optional(),
  email: z.string().email("Invalid email address").max(255, "Email must be at most 255 characters").optional(),
  phone: z.string().max(20, "Phone must be at most 20 characters").optional(),
  job_title: z.string().max(100, "Job title must be at most 100 characters").optional(),
  industry: z.string().max(100, "Industry must be at most 100 characters").optional(),
  lead_source: z.string().min(1, "Lead source is required").max(100, "Lead source must be at most 100 characters").optional(),
  lead_status: z.enum(["new", "contacted", "qualified", "unqualified", "nurturing", "disqualified", "converted", "lost"]).optional(),
  lead_score: z.number().int().min(0).max(100).optional(),
  assigned_to: z.string().uuid("Invalid user ID").optional(),
  notes: z.string().optional(),
  address: z.string().optional(),
  city: z.string().max(100, "City must be at most 100 characters").optional(),
  province: z.string().max(100, "Province must be at most 100 characters").optional(),
  postal_code: z.string().max(20, "Postal code must be at most 20 characters").optional(),
  country: z.string().max(100, "Country must be at most 100 characters").optional(),
  website: z.string().url("Invalid website URL").max(255, "Website must be at most 255 characters").optional().or(z.literal("")),
});

export const convertLeadSchema = z.object({
  opportunity_title: z.string().min(1, "Opportunity title is required").max(255, "Opportunity title must be at most 255 characters"),
  opportunity_description: z.string().optional(),
  stage_id: z.string().uuid("Invalid stage ID"),
  value: z.number().int().min(0).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expected_close_date: z.string().optional(),
  create_account: z.boolean().optional(),
  create_contact: z.boolean().optional(),
  account_id: z.string().uuid("Invalid account ID").optional(),
  contact_id: z.string().uuid("Invalid contact ID").optional(),
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;
export type ConvertLeadFormData = z.infer<typeof convertLeadSchema>;

