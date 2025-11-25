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
		Total        int     `json:"total"`
		Completed    int     `json:"completed"`
		Pending      int     `json:"pending"`
		Approved     int     `json:"approved"`
		Rejected     int     `json:"rejected"`
		ChangePercent float64 `json:"change_percent"`
	} `json:"visit_stats"`
	AccountStats struct {
		Total        int     `json:"total"`
		Active       int     `json:"active"`
		Inactive     int     `json:"inactive"`
		ChangePercent float64 `json:"change_percent"`
	} `json:"account_stats"`
	ActivityStats struct {
		Total        int     `json:"total"`
		Visits       int     `json:"visits"`
		Calls        int     `json:"calls"`
		Emails       int     `json:"emails"`
		ChangePercent float64 `json:"change_percent"`
	} `json:"activity_stats"`
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
	TotalDeals    int     `json:"total_deals"`
	TotalValue    float64 `json:"total_value"`
	WonDeals      int     `json:"won_deals"`
	LostDeals     int     `json:"lost_deals"`
	OpenDeals     int     `json:"open_deals"`
	ByStage       map[string]int `json:"by_stage"`
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

