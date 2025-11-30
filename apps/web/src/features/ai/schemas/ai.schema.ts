import { z } from "zod";

export const analyzeVisitReportSchema = z.object({
  visit_report_id: z.string().uuid("Invalid visit report ID"),
});

export type AnalyzeVisitReportFormData = z.infer<
  typeof analyzeVisitReportSchema
>;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  context: z.string().uuid().optional(),
  context_type: z
    .enum(["visit_report", "deal", "contact", "account"])
    .optional(),
  conversation_history: z.array(chatMessageSchema).optional(),
});

export type ChatFormData = z.infer<typeof chatSchema>;

export const aiSettingsSchema = z.object({
  enabled: z.boolean(),
  data_privacy: z.object({
    allow_visit_reports: z.boolean(),
    allow_accounts: z.boolean(),
    allow_contacts: z.boolean(),
    allow_deals: z.boolean(),
    allow_activities: z.boolean(),
    allow_tasks: z.boolean(),
    allow_products: z.boolean(),
  }),
});

export type AISettingsFormData = z.infer<typeof aiSettingsSchema>;

