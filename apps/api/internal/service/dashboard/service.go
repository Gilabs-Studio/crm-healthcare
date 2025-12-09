package dashboard

import (
	"fmt"
	"strings"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
	"github.com/gilabs/crm-healthcare/api/internal/domain/dashboard"
	pipelinedomain "github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
	taskdomain "github.com/gilabs/crm-healthcare/api/internal/domain/task"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type Service struct {
	visitReportRepo interfaces.VisitReportRepository
	accountRepo     interfaces.AccountRepository
	activityRepo    interfaces.ActivityRepository
	userRepo        interfaces.UserRepository
	dealRepo        interfaces.DealRepository
	taskRepo        interfaces.TaskRepository
	pipelineRepo    interfaces.PipelineRepository
}

func NewService(
	visitReportRepo interfaces.VisitReportRepository,
	accountRepo interfaces.AccountRepository,
	activityRepo interfaces.ActivityRepository,
	userRepo interfaces.UserRepository,
	dealRepo interfaces.DealRepository,
	taskRepo interfaces.TaskRepository,
	pipelineRepo interfaces.PipelineRepository,
) *Service {
	return &Service{
		visitReportRepo: visitReportRepo,
		accountRepo:     accountRepo,
		activityRepo:    activityRepo,
		userRepo:        userRepo,
		dealRepo:        dealRepo,
		taskRepo:        taskRepo,
		pipelineRepo:    pipelineRepo,
	}
}

// parsePeriod parses period string and returns start and end dates
func parsePeriod(period string) (time.Time, time.Time) {
	now := time.Now()
	var start, end time.Time

	switch period {
	case "today":
		start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		end = time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 999999999, now.Location())
	case "week":
		weekday := int(now.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		start = now.AddDate(0, 0, -weekday+1)
		start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, start.Location())
		end = now
	case "month":
		start = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end = now
	case "year":
		start = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
		end = now
	default:
		// Default to today
		start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		end = time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 999999999, now.Location())
	}

	return start, end
}

// GetOverview returns dashboard overview
func (s *Service) GetOverview(req *dashboard.DashboardRequest) (*dashboard.DashboardOverviewResponse, error) {
	// Parse period
	var start, end time.Time
	if req.StartDate != "" && req.EndDate != "" {
		var err error
		start, err = time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			return nil, err
		}
		end, err = time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			return nil, err
		}
		end = time.Date(end.Year(), end.Month(), end.Day(), 23, 59, 59, 999999999, end.Location())
	} else if req.Period != "" {
		start, end = parsePeriod(req.Period)
	} else {
		start, end = parsePeriod("today")
	}

	// Get visit reports in period
	visitReports, _, err := s.visitReportRepo.List(&visit_report.ListVisitReportsRequest{
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
		Page:      1,
		PerPage:   10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Calculate visit stats
	visitStats := struct {
		Total        int
		Completed    int
		Pending      int
		Approved     int
		Rejected     int
		ChangePercent float64
	}{
		Total: len(visitReports),
	}

	for _, vr := range visitReports {
		switch vr.Status {
		case "submitted", "approved":
			visitStats.Completed++
			if vr.Status == "approved" {
				visitStats.Approved++
			}
		case "draft":
			visitStats.Pending++
		case "rejected":
			visitStats.Rejected++
		}
	}

	// Get accounts
	accounts, _, err := s.accountRepo.List(&account.ListAccountsRequest{
		Page:    1,
		PerPage: 10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	accountStats := struct {
		Total        int
		Active       int
		Inactive     int
		ChangePercent float64
	}{
		Total: len(accounts),
	}

	for _, acc := range accounts {
		if acc.Status == "active" {
			accountStats.Active++
		} else {
			accountStats.Inactive++
		}
	}

	// Get activities
	activities, _, err := s.activityRepo.List(&activity.ListActivitiesRequest{
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
		Page:      1,
		PerPage:   10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	activityStats := struct {
		Total         int
		Visits        int
		Calls         int
		Emails        int
		ChangePercent float64
	}{
		Total: len(activities),
	}

	for _, act := range activities {
		switch act.Type {
		case "visit":
			activityStats.Visits++
		case "call":
			activityStats.Calls++
		case "email":
			activityStats.Emails++
		}
	}

	// Get pipeline/deals summary
	var dealsSummary *pipelinedomain.PipelineSummaryResponse
	if s.dealRepo != nil {
		dealsSummary, err = s.dealRepo.GetSummary()
		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, err
		}
	}

	// Aggregate leads by source (using open deals as leads)
	leadsBySource := dashboard.LeadsBySource{}
	if s.dealRepo != nil {
		deals, _, err := s.dealRepo.List(&pipelinedomain.ListDealsRequest{
			Status: "open",
			Page:   1,
			PerPage: 10000,
		})
		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, err
		}

		sourceCounts := make(map[string]int64)
		for _, d := range deals {
			source := d.Source
			if source == "" {
				source = "other"
			}
			sourceCounts[source]++
			leadsBySource.Total++
		}

		entries := make([]dashboard.LeadsBySourceEntry, 0, len(sourceCounts))
		for src, count := range sourceCounts {
			entries = append(entries, dashboard.LeadsBySourceEntry{
				Source: src,
				Count:  count,
			})
		}
		leadsBySource.BySource = entries
	}

	// Upcoming tasks (next few open tasks, sorted by due date in repository layer)
	upcomingTasks := make([]dashboard.DashboardTaskSummary, 0)
	if s.taskRepo != nil {
		tasks, _, err := s.taskRepo.List(&taskdomain.ListTasksRequest{
			Status:   "pending",
			Page:     1,
			PerPage:  10,
		})
		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, err
		}

		for _, t := range tasks {
			upcomingTasks = append(upcomingTasks, dashboard.DashboardTaskSummary{
				ID:       t.ID,
				Title:    t.Title,
				Priority: t.Priority,
				Status:   t.Status,
				DueDate:  t.DueDate,
			})
		}
	}

	// Target / revenue stats from settings + pipeline summary
	targetStats := dashboard.TargetStats{}
	dealsStats := dashboard.DealsStats{}
	revenueStats := dashboard.RevenueStats{}
	pipelineStages := make([]dashboard.DashboardPipelineStageSummary, 0)

	if dealsSummary != nil {
		dealsStats = dashboard.DealsStats{
			TotalDeals:         dealsSummary.TotalDeals,
			OpenDeals:          dealsSummary.OpenDeals,
			WonDeals:           dealsSummary.WonDeals,
			LostDeals:          dealsSummary.LostDeals,
			TotalValue:         dealsSummary.TotalValue,
			TotalValueFormatted: dealsSummary.TotalValueFormatted,
			ChangePercent:      0,
		}

		revenueStats = dashboard.RevenueStats{
			TotalRevenue:          dealsSummary.WonValue,
			TotalRevenueFormatted: dealsSummary.WonValueFormatted,
			ChangePercent:         0,
		}

		// Map pipeline stages with percentage of total deals
		if dealsSummary.TotalDeals > 0 {
			for _, st := range dealsSummary.ByStage {
				percentage := float64(st.DealCount) * 100.0 / float64(dealsSummary.TotalDeals)
				pipelineStages = append(pipelineStages, dashboard.DashboardPipelineStageSummary{
					StageID:    st.StageID,
					StageName:  st.StageName,
					StageCode:  st.StageCode,
					DealCount:  st.DealCount,
					Percentage: percentage,
				})
			}
		}
	}

	// Sales target is currently not configurable; keep defaults (zero target).

	response := &dashboard.DashboardOverviewResponse{
		Period: struct {
			Type  string    `json:"type"`
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
		}{
			Type:  req.Period,
			Start: start,
			End:   end,
		},
		VisitStats: struct {
			Total         int     `json:"total"`
			Completed     int     `json:"completed"`
			Pending       int     `json:"pending"`
			Approved      int     `json:"approved"`
			Rejected      int     `json:"rejected"`
			ChangePercent float64 `json:"change_percent"`
		}{
			Total:        visitStats.Total,
			Completed:    visitStats.Completed,
			Pending:      visitStats.Pending,
			Approved:     visitStats.Approved,
			Rejected:     visitStats.Rejected,
			ChangePercent: visitStats.ChangePercent,
		},
		AccountStats: struct {
			Total         int     `json:"total"`
			Active        int     `json:"active"`
			Inactive      int     `json:"inactive"`
			ChangePercent float64 `json:"change_percent"`
		}{
			Total:        accountStats.Total,
			Active:       accountStats.Active,
			Inactive:     accountStats.Inactive,
			ChangePercent: accountStats.ChangePercent,
		},
		ActivityStats: struct {
			Total         int     `json:"total"`
			Visits        int     `json:"visits"`
			Calls         int     `json:"calls"`
			Emails        int     `json:"emails"`
			ChangePercent float64 `json:"change_percent"`
		}{
			Total:        activityStats.Total,
			Visits:       activityStats.Visits,
			Calls:        activityStats.Calls,
			Emails:       activityStats.Emails,
			ChangePercent: activityStats.ChangePercent,
		},
		Target:         targetStats,
		Deals:          dealsStats,
		Revenue:        revenueStats,
		LeadsBySource:  leadsBySource,
		UpcomingTasks:  upcomingTasks,
		PipelineStages: pipelineStages,
	}

	return response, nil
}

// GetVisitStatistics returns visit statistics
func (s *Service) GetVisitStatistics(req *dashboard.DashboardRequest) (*dashboard.VisitStatisticsResponse, error) {
	var start, end time.Time
	if req.StartDate != "" && req.EndDate != "" {
		var err error
		start, err = time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			return nil, err
		}
		end, err = time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			return nil, err
		}
		end = time.Date(end.Year(), end.Month(), end.Day(), 23, 59, 59, 999999999, end.Location())
	} else if req.Period != "" {
		start, end = parsePeriod(req.Period)
	} else {
		start, end = parsePeriod("today")
	}

	visitReports, _, err := s.visitReportRepo.List(&visit_report.ListVisitReportsRequest{
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
		Page:      1,
		PerPage:   10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	byStatus := make(map[string]int)
	byDate := make(map[string]struct {
		Total     int
		Completed int
		Approved  int
		Pending   int
		Rejected  int
	})

	total := len(visitReports)
	completed := 0
	pending := 0
	approved := 0
	rejected := 0

	for _, vr := range visitReports {
		byStatus[vr.Status]++
		dateKey := vr.VisitDate.Format("2006-01-02")
		stat := byDate[dateKey]
		stat.Total++

		switch vr.Status {
		case "submitted", "approved":
			completed++
			stat.Completed++
			if vr.Status == "approved" {
				approved++
				stat.Approved++
			}
		case "draft":
			pending++
			stat.Pending++
		case "rejected":
			rejected++
			stat.Rejected++
		}

		byDate[dateKey] = stat
	}

	// Convert byDate map to slice
	dateStats := make([]dashboard.DateStat, 0, len(byDate))
	for date, stat := range byDate {
		dateStats = append(dateStats, dashboard.DateStat{
			Date:      date,
			Count:     stat.Total,
			Completed: stat.Completed,
			Approved:  stat.Approved,
			Pending:   stat.Pending,
			Rejected:  stat.Rejected,
		})
	}

	// Sort by date
	for i := 0; i < len(dateStats)-1; i++ {
		for j := i + 1; j < len(dateStats); j++ {
			if dateStats[i].Date > dateStats[j].Date {
				dateStats[i], dateStats[j] = dateStats[j], dateStats[i]
			}
		}
	}

	response := &dashboard.VisitStatisticsResponse{
		Period: struct {
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
		}{
			Start: start,
			End:   end,
		},
		Total:        total,
		Completed:    completed,
		Pending:      pending,
		Approved:     approved,
		Rejected:     rejected,
		ByStatus:     byStatus,
		ByDate:       dateStats,
		ChangePercent: 0, // Can be calculated by comparing with previous period
	}

	return response, nil
}

// GetPipelineSummary returns pipeline summary with all stages including their colors
func (s *Service) GetPipelineSummary(req *dashboard.DashboardRequest) (*dashboard.PipelineSummaryResponse, error) {
	if s.dealRepo == nil || s.pipelineRepo == nil {
		return &dashboard.PipelineSummaryResponse{
			TotalDeals: 0,
			TotalValue: 0,
			WonDeals:   0,
			LostDeals:  0,
			OpenDeals:  0,
			ByStage:    []dashboard.DashboardPipelineStageSummary{},
		}, nil
	}

	// Get deal summary
	summary, err := s.dealRepo.GetSummary()
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			summary = &pipelinedomain.PipelineSummaryResponse{
				TotalDeals: 0,
				TotalValue: 0,
				WonDeals:   0,
				LostDeals:  0,
				OpenDeals:  0,
				ByStage:    []pipelinedomain.StageSummary{},
			}
		} else {
			return nil, err
		}
	}

	// Get all active pipeline stages
	listReq := &pipelinedomain.ListPipelineStagesRequest{
		IsActive: func() *bool { b := true; return &b }(),
	}
	allStages, err := s.pipelineRepo.ListStages(listReq)
	if err != nil {
		return nil, err
	}

	// Create a map of stage_id to deal stats for quick lookup
	dealStatsByStageID := make(map[string]pipelinedomain.StageSummary)
	for _, st := range summary.ByStage {
		dealStatsByStageID[st.StageID] = st
	}

	// Build response with all stages (including those with 0 deals)
	byStage := make([]dashboard.DashboardPipelineStageSummary, 0, len(allStages))
	for _, stage := range allStages {
		dealStats, hasDeals := dealStatsByStageID[stage.ID]
		
		stageSummary := dashboard.DashboardPipelineStageSummary{
			StageID:             stage.ID,
			StageName:           stage.Name,
			StageCode:           stage.Code,
			StageColor:          stage.Color,
			DealCount:           0,
			TotalValue:          0,
			TotalValueFormatted: formatCurrency(0),
			Percentage:          0,
		}

		if hasDeals {
			stageSummary.DealCount = dealStats.DealCount
			stageSummary.TotalValue = dealStats.TotalValue
			stageSummary.TotalValueFormatted = dealStats.TotalValueFormatted
			if summary.TotalDeals > 0 {
				stageSummary.Percentage = float64(dealStats.DealCount) / float64(summary.TotalDeals) * 100
			}
		}

		byStage = append(byStage, stageSummary)
	}

	response := &dashboard.PipelineSummaryResponse{
		TotalDeals: summary.TotalDeals,
		TotalValue: summary.TotalValue,
		WonDeals:   summary.WonDeals,
		LostDeals:  summary.LostDeals,
		OpenDeals:  summary.OpenDeals,
		ByStage:    byStage,
	}
	return response, nil
}

// formatCurrency formats integer (sen) to formatted currency string
func formatCurrency(amount int64) string {
	// Convert to Rupiah (divide by 100 if stored in sen)
	rupiah := float64(amount) / 100.0
	// Format with thousand separator
	formatted := formatNumber(rupiah)
	return "Rp " + formatted
}

// formatNumber formats number with thousand separator
func formatNumber(n float64) string {
	// Convert to int64 to remove decimal places
	amount := int64(n)

	// Handle zero case
	if amount == 0 {
		return "0"
	}

	// Handle negative numbers
	negative := false
	if amount < 0 {
		negative = true
		amount = -amount
	}

	// Convert to string
	str := fmt.Sprintf("%d", amount)
	length := len(str)
	
	// Add thousand separators (dot for Indonesian format)
	var parts []string
	for i := length; i > 0; i -= 3 {
		start := i - 3
		if start < 0 {
			start = 0
		}
		parts = append([]string{str[start:i]}, parts...)
	}
	
	result := strings.Join(parts, ".")
	if negative {
		result = "-" + result
	}
	
	return result
}

// GetTopAccounts returns top accounts
func (s *Service) GetTopAccounts(req *dashboard.DashboardRequest) ([]dashboard.TopAccountResponse, error) {
	limit := req.Limit
	if limit <= 0 {
		limit = 10
	}

	// Get all visit reports
	visitReports, _, err := s.visitReportRepo.List(&visit_report.ListVisitReportsRequest{
		Page:    1,
		PerPage: 10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Count visits per account
	accountVisitCount := make(map[string]int)
	accountLastVisit := make(map[string]time.Time)

	for _, vr := range visitReports {
		if vr.AccountID != nil && *vr.AccountID != "" {
			accountVisitCount[*vr.AccountID]++
			if lastVisit, exists := accountLastVisit[*vr.AccountID]; !exists || vr.VisitDate.After(lastVisit) {
				accountLastVisit[*vr.AccountID] = vr.VisitDate
			}
		}
	}

	// Get activities per account
	activities, _, err := s.activityRepo.List(&activity.ListActivitiesRequest{
		Page:    1,
		PerPage: 10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	accountActivityCount := make(map[string]int)
	for _, act := range activities {
		if act.AccountID != nil {
			accountActivityCount[*act.AccountID]++
		}
	}

	// Get accounts
	accounts, _, err := s.accountRepo.List(&account.ListAccountsRequest{
		Page:    1,
		PerPage: 10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Build response
	results := make([]dashboard.TopAccountResponse, 0)
	for _, acc := range accounts {
		visitCount := accountVisitCount[acc.ID]
		activityCount := accountActivityCount[acc.ID]
		lastVisit := accountLastVisit[acc.ID]

		results = append(results, dashboard.TopAccountResponse{
			Account: struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			}{
				ID:   acc.ID,
				Name: acc.Name,
			},
			VisitCount:    visitCount,
			ActivityCount: activityCount,
			LastVisitDate: &lastVisit,
		})
	}

	// Sort by visit count (simple implementation)
	// In production, use sort.Slice or database query with ORDER BY
	if len(results) > limit {
		results = results[:limit]
	}

	return results, nil
}

// GetTopSalesRep returns top sales reps
func (s *Service) GetTopSalesRep(req *dashboard.DashboardRequest) ([]dashboard.TopSalesRepResponse, error) {
	limit := req.Limit
	if limit <= 0 {
		limit = 10
	}

	// Get all visit reports
	visitReports, _, err := s.visitReportRepo.List(&visit_report.ListVisitReportsRequest{
		Page:    1,
		PerPage: 10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Count visits per sales rep
	salesRepVisitCount := make(map[string]int)
	salesRepAccountSet := make(map[string]map[string]bool)

	for _, vr := range visitReports {
		salesRepVisitCount[vr.SalesRepID]++
		if salesRepAccountSet[vr.SalesRepID] == nil {
			salesRepAccountSet[vr.SalesRepID] = make(map[string]bool)
		}
		if vr.AccountID != nil && *vr.AccountID != "" {
			salesRepAccountSet[vr.SalesRepID][*vr.AccountID] = true
		}
	}

	// Get activities per sales rep
	activities, _, err := s.activityRepo.List(&activity.ListActivitiesRequest{
		Page:    1,
		PerPage: 10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	salesRepActivityCount := make(map[string]int)
	for _, act := range activities {
		salesRepActivityCount[act.UserID]++
	}

	// Get users
	users, _, err := s.userRepo.List(&user.ListUsersRequest{
		Page:    1,
		PerPage: 10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Build response
	results := make([]dashboard.TopSalesRepResponse, 0)
	for _, user := range users {
		visitCount := salesRepVisitCount[user.ID]
		accountCount := len(salesRepAccountSet[user.ID])
		activityCount := salesRepActivityCount[user.ID]

		if visitCount > 0 || accountCount > 0 || activityCount > 0 {
			results = append(results, dashboard.TopSalesRepResponse{
				SalesRep: struct {
					ID   string `json:"id"`
					Name string `json:"name"`
					Email string `json:"email"`
				}{
					ID:   user.ID,
					Name: user.Name,
					Email: user.Email,
				},
				VisitCount:    visitCount,
				AccountCount:  accountCount,
				ActivityCount: activityCount,
			})
		}
	}

	// Sort by visit count (simple implementation)
	if len(results) > limit {
		results = results[:limit]
	}

	return results, nil
}

// GetRecentActivities returns recent activities
func (s *Service) GetRecentActivities(req *dashboard.DashboardRequest) ([]dashboard.RecentActivityResponse, error) {
	limit := req.Limit
	if limit <= 0 {
		limit = 50
	}

	activities, _, err := s.activityRepo.List(&activity.ListActivitiesRequest{
		Page:    1,
		PerPage: limit,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	results := make([]dashboard.RecentActivityResponse, 0, len(activities))
	for _, act := range activities {
		response := dashboard.RecentActivityResponse{
			ID:          act.ID,
			Type:        act.Type,
			Description: act.Description,
			User: struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			}{
				ID:   act.UserID,
				Name: "", // Will be populated if needed
			},
			Timestamp: act.Timestamp,
		}

		if act.AccountID != nil {
			account, err := s.accountRepo.FindByID(*act.AccountID)
			if err == nil {
				response.Account = &struct {
					ID   string `json:"id"`
					Name string `json:"name"`
				}{
					ID:   account.ID,
					Name: account.Name,
				}
			}
		}

		results = append(results, response)
	}

	return results, nil
}

// GetActivityTrends returns activity trends by date
func (s *Service) GetActivityTrends(req *dashboard.DashboardRequest) (*dashboard.ActivityTrendsResponse, error) {
	var start, end time.Time
	if req.StartDate != "" && req.EndDate != "" {
		var err error
		start, err = time.Parse("2006-01-02", req.StartDate)
		if err != nil {
			return nil, err
		}
		end, err = time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			return nil, err
		}
		end = time.Date(end.Year(), end.Month(), end.Day(), 23, 59, 59, 999999999, end.Location())
	} else if req.Period != "" {
		start, end = parsePeriod(req.Period)
	} else {
		start, end = parsePeriod("month")
	}

	// Get activities
	activities, _, err := s.activityRepo.List(&activity.ListActivitiesRequest{
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
		Page:      1,
		PerPage:   10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Group activities by date and type
	byDate := make(map[string]struct {
		Visits int
		Calls  int
		Emails int
		Total  int
	})

	for _, act := range activities {
		dateKey := act.Timestamp.Format("2006-01-02")
		stat := byDate[dateKey]
		stat.Total++

		switch act.Type {
		case "visit":
			stat.Visits++
		case "call":
			stat.Calls++
		case "email":
			stat.Emails++
		}

		byDate[dateKey] = stat
	}

	// Convert to slice and sort by date
	dateStats := make([]dashboard.ActivityDateStat, 0, len(byDate))
	for date, stat := range byDate {
		dateStats = append(dateStats, dashboard.ActivityDateStat{
			Date:   date,
			Visits: stat.Visits,
			Calls:  stat.Calls,
			Emails: stat.Emails,
			Total:  stat.Total,
		})
	}

	// Sort by date
	for i := 0; i < len(dateStats)-1; i++ {
		for j := i + 1; j < len(dateStats); j++ {
			if dateStats[i].Date > dateStats[j].Date {
				dateStats[i], dateStats[j] = dateStats[j], dateStats[i]
			}
		}
	}

	response := &dashboard.ActivityTrendsResponse{
		Period: struct {
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
		}{
			Start: start,
			End:   end,
		},
		ByDate: dateStats,
	}

	return response, nil
}

