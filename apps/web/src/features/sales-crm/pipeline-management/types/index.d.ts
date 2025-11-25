// Pipeline Stage Types
export interface PipelineStage {
  id: string;
  name: string;
  code: string;
  order: number;
  color: string;
  is_active: boolean;
  is_won: boolean;
  is_lost: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

// Deal Reference Types
export interface AccountRef {
  id: string;
  name: string;
}

export interface ContactRef {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface UserRef {
  id: string;
  name: string;
  email?: string;
}

// Deal Types
export interface Deal {
  id: string;
  title: string;
  description: string;
  account_id: string;
  account?: AccountRef;
  contact_id?: string;
  contact?: ContactRef;
  stage_id: string;
  stage?: PipelineStage;
  value: number; // in smallest currency unit (sen)
  value_formatted?: string;
  probability: number; // 0-100
  expected_close_date?: string;
  actual_close_date?: string;
  assigned_to?: string;
  assigned_user?: UserRef;
  status: "open" | "won" | "lost";
  source?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Pipeline Summary Types
export interface StageSummary {
  stage_id: string;
  stage_name: string;
  stage_code: string;
  deal_count: number;
  total_value: number;
  total_value_formatted: string;
}

export interface PipelineSummary {
  total_deals: number;
  total_value: number;
  total_value_formatted: string;
  won_deals: number;
  won_value: number;
  won_value_formatted: string;
  lost_deals: number;
  lost_value: number;
  lost_value_formatted: string;
  open_deals: number;
  open_value: number;
  open_value_formatted: string;
  by_stage: StageSummary[];
}

// Forecast Types
export interface ForecastPeriod {
  type: "month" | "quarter" | "year";
  start: string;
  end: string;
}

export interface ForecastDeal {
  id: string;
  title: string;
  account_name: string;
  stage_name: string;
  value: number;
  value_formatted: string;
  probability: number;
  expected_close_date: string;
  weighted_value: number;
  weighted_value_formatted: string;
}

export interface Forecast {
  period: ForecastPeriod;
  expected_revenue: number;
  expected_revenue_formatted: string;
  weighted_revenue: number;
  weighted_revenue_formatted: string;
  deals: ForecastDeal[];
}

// API Response Types
export interface ListPipelineStagesResponse {
  success: boolean;
  data: PipelineStage[];
  meta?: {
    filters?: Record<string, unknown>;
  };
  timestamp: string;
  request_id: string;
}

export interface PipelineStageResponse {
  success: boolean;
  data: PipelineStage;
  timestamp: string;
  request_id: string;
}

export interface ListDealsResponse {
  success: boolean;
  data: Deal[];
  meta: {
    pagination: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    filters?: Record<string, unknown>;
  };
  timestamp: string;
  request_id: string;
}

export interface DealResponse {
  success: boolean;
  data: Deal;
  timestamp: string;
  request_id: string;
}

export interface PipelineSummaryResponse {
  success: boolean;
  data: PipelineSummary;
  timestamp: string;
  request_id: string;
}

export interface ForecastResponse {
  success: boolean;
  data: Forecast;
  timestamp: string;
  request_id: string;
}

