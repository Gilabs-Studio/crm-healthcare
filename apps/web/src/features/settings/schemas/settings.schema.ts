import { z } from "zod";

export const generalSettingsSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_email: z.string().email("Invalid email format").optional().or(z.literal("")),
  company_phone: z.string().optional(),
  company_address: z.string().optional(),
  company_logo: z.string().url("Invalid URL format").optional().or(z.literal("")),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  currency: z.string().optional(),
});

export const notificationSettingsSchema = z.object({
  email_notifications: z.string().optional(),
  sms_notifications: z.string().optional(),
  push_notifications: z.string().optional(),
  visit_report_notifications: z.string().optional(),
  task_reminder_notifications: z.string().optional(),
  pipeline_update_notifications: z.string().optional(),
});

export const pipelineSettingsSchema = z.object({
  stages: z.string().optional(), // JSON string of stages
  default_stage: z.string().optional(),
  auto_advance: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  general: z.record(z.string()).optional(),
  notifications: z.record(z.string()).optional(),
  pipeline: z.record(z.string()).optional(),
});

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type PipelineSettingsFormData = z.infer<typeof pipelineSettingsSchema>;
export type UpdateSettingsFormData = z.infer<typeof updateSettingsSchema>;


