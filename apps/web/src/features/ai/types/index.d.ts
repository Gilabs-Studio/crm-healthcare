export type InsightType = "visit_report" | "deal" | "contact" | "account";

export interface VisitReportInsight {
  summary: string;
  action_items: string[];
  sentiment: "positive" | "neutral" | "negative";
  key_points: string[];
  recommendations: string[];
}

export interface InsightResponse {
  type: InsightType;
  data: VisitReportInsight;
  tokens: number;
}

export interface AnalyzeVisitReportRequest {
  visit_report_id: string;
}

export interface AnalyzeVisitReportResponse {
  success: boolean;
  data: InsightResponse;
  timestamp: string;
  request_id: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  context?: string;
  context_type?: "visit_report" | "deal" | "contact" | "account";
  conversation_history?: ChatMessage[];
  model?: string;
}

export interface AISettingsResponse {
  id: string;
  enabled: boolean;
  provider: string;
  model: string;
  base_url?: string;
  data_privacy: AIDataPrivacySettings;
  timezone: string;
  usage_limit?: number;
  current_usage: number;
  usage_reset_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  message: string;
  tokens: number;
}

export interface ChatAPIResponse {
  success: boolean;
  data: ChatResponse;
  timestamp: string;
  request_id: string;
}

export interface AIDataPrivacySettings {
  allow_visit_reports: boolean;
  allow_accounts: boolean;
  allow_contacts: boolean;
  allow_deals: boolean;
  allow_activities: boolean;
  allow_tasks: boolean;
  allow_products: boolean;
}

export interface AISettings {
  data_privacy: AIDataPrivacySettings;
  enabled: boolean;
}

