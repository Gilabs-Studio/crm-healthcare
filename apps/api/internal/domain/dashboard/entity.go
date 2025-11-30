package dashboard

import "time"

// DashboardOverviewResponse represents dashboard overview data
type DashboardOverviewResponse struct {
	Period struct {
		Type  string    `json:"type"` // today, week, month, year
		Start time.Time `json:"start"`
		End   time.Time `json:"end"`
	} `json:"period"`
	VisitStats struct {
		Total         int     `json:"total"`
		Completed     int     `json:"completed"`
		Pending       int     `json:"pending"`
		Approved      int     `json:"approved"`
		Rejected      int     `json:"rejected"`
		ChangePercent float64 `json:"change_percent"`
	} `json:"visit_stats"`
	AccountStats struct {
		Total         int     `json:"total"`
		Active        int     `json:"active"`
		Inactive      int     `json:"inactive"`
		ChangePercent float64 `json:"change_percent"`
	} `json:"account_stats"`
	ActivityStats struct {
		Total         int     `json:"total"`
		Visits        int     `json:"visits"`
		Calls         int     `json:"calls"`
		Emails        int     `json:"emails"`
		ChangePercent float64 `json:"change_percent"`
	} `json:"activity_stats"`

	// Target represents sales target vs achievement for the selected period.
	// This is used by the "Your target is incomplete" card in the dashboard UI.
	Target TargetStats `json:"target"`

	// Deals contains high‑level deal statistics for the selected period.
	Deals DealsStats `json:"deals"`

	// Revenue contains revenue statistics (typically based on won deals).
	Revenue RevenueStats `json:"revenue"`

	// LeadsBySource aggregates open deals/leads grouped by their source
	// (e.g. social, email, call, others) for the donut chart.
	LeadsBySource LeadsBySource `json:"leads_by_source"`

	// UpcomingTasks contains a small snapshot of upcoming tasks used by the
	// dashboard tasks widget.
	UpcomingTasks []DashboardTaskSummary `json:"upcoming_tasks"`

	// PipelineStages contains simplified pipeline stage distribution used by
	// the sales pipeline progress bar in the dashboard.
	PipelineStages []DashboardPipelineStageSummary `json:"pipeline_stages"`
}

// TargetStats represents sales target vs achievement metrics.
type TargetStats struct {
	TargetAmount          int64   `json:"target_amount"`
	TargetAmountFormatted string  `json:"target_amount_formatted"`
	AchievedAmount        int64   `json:"achieved_amount"`
	AchievedAmountFormatted string `json:"achieved_amount_formatted"`
	ProgressPercent       float64 `json:"progress_percent"`
	ChangePercent         float64 `json:"change_percent"`
}

// DealsStats represents high‑level deal metrics.
type DealsStats struct {
	TotalDeals int64  `json:"total_deals"`
	OpenDeals  int64  `json:"open_deals"`
	WonDeals   int64  `json:"won_deals"`
	LostDeals  int64  `json:"lost_deals"`
	TotalValue int64  `json:"total_value"`
	TotalValueFormatted string `json:"total_value_formatted"`
	ChangePercent float64 `json:"change_percent"`
}

// RevenueStats represents revenue metrics (derived from won deals).
type RevenueStats struct {
	TotalRevenue          int64   `json:"total_revenue"`
	TotalRevenueFormatted string  `json:"total_revenue_formatted"`
	ChangePercent         float64 `json:"change_percent"`
}

// LeadsBySourceEntry represents a single lead source bucket.
type LeadsBySourceEntry struct {
	Source string `json:"source"`
	Count  int64  `json:"count"`
}

// LeadsBySource aggregates total leads and distribution by source.
type LeadsBySource struct {
	Total    int64               `json:"total"`
	BySource []LeadsBySourceEntry `json:"by_source"`
}

// DashboardTaskSummary is a lightweight projection of a task for the dashboard.
type DashboardTaskSummary struct {
	ID       string     `json:"id"`
	Title    string     `json:"title"`
	Priority string     `json:"priority"`
	Status   string     `json:"status"`
	DueDate  *time.Time `json:"due_date,omitempty"`
}

// DashboardPipelineStageSummary represents simplified stage stats for dashboard.
type DashboardPipelineStageSummary struct {
	StageID             string  `json:"stage_id"`
	StageName           string  `json:"stage_name"`
	StageCode           string  `json:"stage_code"`
	StageColor          string  `json:"stage_color"`
	DealCount           int64   `json:"deal_count"`
	TotalValue          int64   `json:"total_value"`
	TotalValueFormatted string  `json:"total_value_formatted"`
	Percentage          float64 `json:"percentage"`
}

// VisitStatisticsResponse represents visit statistics
type VisitStatisticsResponse struct {
	Period struct {
		Start time.Time `json:"start"`
		End   time.Time `json:"end"`
	} `json:"period"`
	Total        int     `json:"total"`
	Completed    int     `json:"completed"`
	Pending      int     `json:"pending"`
	Approved     int     `json:"approved"`
	Rejected     int     `json:"rejected"`
	ByStatus     map[string]int `json:"by_status"`
	ByDate       []DateStat     `json:"by_date"`
	ChangePercent float64 `json:"change_percent"`
}

// DateStat represents statistics for a specific date
type DateStat struct {
	Date      string `json:"date"`
	Count     int    `json:"count"`
	Completed int    `json:"completed"`
	Approved  int    `json:"approved"`
	Pending   int    `json:"pending"`
	Rejected  int    `json:"rejected"`
}

// PipelineSummaryResponse represents pipeline summary (placeholder for future)
type PipelineSummaryResponse struct {
	TotalDeals int64                          `json:"total_deals"`
	TotalValue int64                          `json:"total_value"`
	WonDeals   int64                          `json:"won_deals"`
	LostDeals  int64                          `json:"lost_deals"`
	OpenDeals  int64                          `json:"open_deals"`
	// ByStage contains all stages with their stats (including stages with 0 deals)
	ByStage []DashboardPipelineStageSummary `json:"by_stage"`
}

// TopAccountResponse represents top account data
type TopAccountResponse struct {
	Account struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"account"`
	VisitCount    int     `json:"visit_count"`
	ActivityCount int     `json:"activity_count"`
	LastVisitDate *time.Time `json:"last_visit_date,omitempty"`
}

// TopSalesRepResponse represents top sales rep data
type TopSalesRepResponse struct {
	SalesRep struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		Email string `json:"email"`
	} `json:"sales_rep"`
	VisitCount    int     `json:"visit_count"`
	AccountCount  int     `json:"account_count"`
	ActivityCount int     `json:"activity_count"`
}

// RecentActivityResponse represents recent activity data
type RecentActivityResponse struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	Account     *struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"account,omitempty"`
	Contact     *struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"contact,omitempty"`
	User        struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"user"`
	Timestamp   time.Time `json:"timestamp"`
}

// ActivityTrendsResponse represents activity trends by date
type ActivityTrendsResponse struct {
	Period struct {
		Start time.Time `json:"start"`
		End   time.Time `json:"end"`
	} `json:"period"`
	ByDate []ActivityDateStat `json:"by_date"`
}

// ActivityDateStat represents activity statistics for a specific date
type ActivityDateStat struct {
	Date   string `json:"date"`
	Visits int    `json:"visits"`
	Calls  int    `json:"calls"`
	Emails int    `json:"emails"`
	Total  int    `json:"total"`
}

// DashboardRequest represents request parameters for dashboard
type DashboardRequest struct {
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
	Period    string `form:"period"` // today, week, month, year
	Limit     int    `form:"limit"`
}

