export interface DashboardOverview {
  period: {
    type: string;
    start: string;
    end: string;
  };
  visit_stats: {
    total: number;
    completed: number;
    pending: number;
    approved: number;
    rejected: number;
    change_percent: number;
  };
  account_stats: {
    total: number;
    active: number;
    inactive: number;
    change_percent: number;
  };
  activity_stats: {
    total: number;
    visits: number;
    calls: number;
    emails: number;
    change_percent: number;
  };
}

export interface VisitStatistics {
  period: {
    start: string;
    end: string;
  };
  total: number;
  completed: number;
  pending: number;
  approved: number;
  rejected: number;
  by_status: Record<string, number>;
  by_date: Array<{
    date: string;
    count: number;
    completed: number;
    approved: number;
    pending: number;
    rejected: number;
  }>;
  change_percent: number;
}

export interface PipelineSummary {
  total_deals: number;
  total_value: number;
  won_deals: number;
  lost_deals: number;
  open_deals: number;
  by_stage: Record<string, number>;
}

export interface TopAccount {
  account: {
    id: string;
    name: string;
  };
  visit_count: number;
  activity_count: number;
  last_visit_date?: string;
}

export interface TopSalesRep {
  sales_rep: {
    id: string;
    name: string;
    email: string;
  };
  visit_count: number;
  account_count: number;
  activity_count: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  account?: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
  timestamp: string;
}

export interface DashboardOverviewResponse {
  success: boolean;
  data: DashboardOverview;
  timestamp: string;
  request_id: string;
}

export interface VisitStatisticsResponse {
  success: boolean;
  data: VisitStatistics;
  timestamp: string;
  request_id: string;
}

export interface PipelineSummaryResponse {
  success: boolean;
  data: PipelineSummary;
  timestamp: string;
  request_id: string;
}

export interface TopAccountsResponse {
  success: boolean;
  data: TopAccount[];
  timestamp: string;
  request_id: string;
}

export interface TopSalesRepResponse {
  success: boolean;
  data: TopSalesRep[];
  timestamp: string;
  request_id: string;
}

export interface RecentActivitiesResponse {
  success: boolean;
  data: RecentActivity[];
  timestamp: string;
  request_id: string;
}

export interface ActivityTrends {
  period: {
    start: string;
    end: string;
  };
  by_date: Array<{
    date: string;
    visits: number;
    calls: number;
    emails: number;
    total: number;
  }>;
}

export interface ActivityTrendsResponse {
  success: boolean;
  data: ActivityTrends;
  timestamp: string;
  request_id: string;
}

export interface DashboardRequestParams {
  start_date?: string;
  end_date?: string;
  period?: "today" | "week" | "month" | "year";
  limit?: number;
}

