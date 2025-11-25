package report

import "time"

// VisitReportReportResponse represents visit report report data
type VisitReportReportResponse struct {
	Period struct {
		Start time.Time `json:"start"`
		End   time.Time `json:"end"`
	} `json:"period"`
	Summary struct {
		Total        int     `json:"total"`
		Completed    int     `json:"completed"`
		Pending      int     `json:"pending"`
		Approved     int     `json:"approved"`
		Rejected     int     `json:"rejected"`
	} `json:"summary"`
	ByAccount    []AccountStat `json:"by_account"`
	BySalesRep   []SalesRepStat `json:"by_sales_rep"`
	ByDate       []DateStat     `json:"by_date"`
	ByStatus     map[string]int `json:"by_status"`
}

// AccountStat represents statistics for an account
type AccountStat struct {
	Account struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"account"`
	VisitCount int `json:"visit_count"`
}

// SalesRepStat represents statistics for a sales rep
type SalesRepStat struct {
	SalesRep struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"sales_rep"`
	VisitCount int `json:"visit_count"`
}

// DateStat represents statistics for a specific date
type DateStat struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

// PipelineReportResponse represents pipeline report (placeholder for future)
type PipelineReportResponse struct {
	Period struct {
		Start time.Time `json:"start"`
		End   time.Time `json:"end"`
	} `json:"period"`
	Summary struct {
		TotalDeals int     `json:"total_deals"`
		TotalValue float64 `json:"total_value"`
		WonDeals   int     `json:"won_deals"`
		LostDeals  int     `json:"lost_deals"`
	} `json:"summary"`
	ByStage map[string]int `json:"by_stage"`
}

// SalesPerformanceReportResponse represents sales performance report
type SalesPerformanceReportResponse struct {
	Period struct {
		Start time.Time `json:"start"`
		End   time.Time `json:"end"`
	} `json:"period"`
	BySalesRep []SalesPerformanceStat `json:"by_sales_rep"`
	Summary    struct {
		TotalVisits      int     `json:"total_visits"`
		TotalAccounts    int     `json:"total_accounts"`
		AverageVisitsPerAccount float64 `json:"average_visits_per_account"`
	} `json:"summary"`
}

// SalesPerformanceStat represents sales performance statistics
type SalesPerformanceStat struct {
	SalesRep struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		Email string `json:"email"`
	} `json:"sales_rep"`
	VisitCount    int     `json:"visit_count"`
	AccountCount  int     `json:"account_count"`
	ActivityCount int     `json:"activity_count"`
	CompletionRate float64 `json:"completion_rate"`
}

// AccountActivityReportResponse represents account activity report
type AccountActivityReportResponse struct {
	Period struct {
		Start time.Time `json:"start"`
		End   time.Time `json:"end"`
	} `json:"period"`
	AccountID   string `json:"account_id"`
	AccountName string `json:"account_name"`
	Summary     struct {
		TotalVisits   int `json:"total_visits"`
		TotalActivities int `json:"total_activities"`
		TotalContacts int `json:"total_contacts"`
	} `json:"summary"`
	Activities  []ActivityDetail `json:"activities"`
	Visits      []VisitDetail     `json:"visits"`
}

// ActivityDetail represents activity detail
type ActivityDetail struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Description string    `json:"description"`
	Timestamp   time.Time `json:"timestamp"`
	User        struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"user"`
}

// VisitDetail represents visit detail
type VisitDetail struct {
	ID        string    `json:"id"`
	VisitDate time.Time `json:"visit_date"`
	Purpose   string    `json:"purpose"`
	Status    string    `json:"status"`
	SalesRep  struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"sales_rep"`
}

// ReportRequest represents request parameters for reports
type ReportRequest struct {
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
	AccountID string `form:"account_id"`
	SalesRepID string `form:"sales_rep_id"`
	Status    string `form:"status"`
	Limit     int    `form:"limit"`
}

