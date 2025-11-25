export interface VisitReportReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    total: number;
    completed: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  by_account: Array<{
    account: {
      id: string;
      name: string;
    };
    visit_count: number;
  }>;
  by_sales_rep: Array<{
    sales_rep: {
      id: string;
      name: string;
    };
    visit_count: number;
  }>;
  by_date: Array<{
    date: string;
    count: number;
  }>;
  by_status: Record<string, number>;
}

export interface PipelineReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_deals: number;
    total_value: number;
    won_deals: number;
    lost_deals: number;
  };
  by_stage: Record<string, number>;
}

export interface SalesPerformanceReport {
  period: {
    start: string;
    end: string;
  };
  by_sales_rep: Array<{
    sales_rep: {
      id: string;
      name: string;
      email: string;
    };
    visit_count: number;
    account_count: number;
    activity_count: number;
    completion_rate: number;
  }>;
  summary: {
    total_visits: number;
    total_accounts: number;
    average_visits_per_account: number;
  };
}

export interface AccountActivityReport {
  period: {
    start: string;
    end: string;
  };
  account_id: string;
  account_name: string;
  summary: {
    total_visits: number;
    total_activities: number;
    total_contacts: number;
  };
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: {
      id: string;
      name: string;
    };
  }>;
  visits: Array<{
    id: string;
    visit_date: string;
    purpose: string;
    status: string;
    sales_rep: {
      id: string;
      name: string;
    };
  }>;
}

export interface VisitReportReportResponse {
  success: boolean;
  data: VisitReportReport;
  timestamp: string;
  request_id: string;
}

export interface PipelineReportResponse {
  success: boolean;
  data: PipelineReport;
  timestamp: string;
  request_id: string;
}

export interface SalesPerformanceReportResponse {
  success: boolean;
  data: SalesPerformanceReport;
  timestamp: string;
  request_id: string;
}

export interface AccountActivityReportResponse {
  success: boolean;
  data: AccountActivityReport;
  timestamp: string;
  request_id: string;
}

export interface ReportRequestParams {
  start_date?: string;
  end_date?: string;
  account_id?: string;
  sales_rep_id?: string;
  status?: string;
  limit?: number;
}

