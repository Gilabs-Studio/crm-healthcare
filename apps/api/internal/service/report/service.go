package report

import (
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/report"
	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type Service struct {
	visitReportRepo interfaces.VisitReportRepository
	accountRepo     interfaces.AccountRepository
	activityRepo    interfaces.ActivityRepository
	userRepo        interfaces.UserRepository
}

func NewService(
	visitReportRepo interfaces.VisitReportRepository,
	accountRepo interfaces.AccountRepository,
	activityRepo interfaces.ActivityRepository,
	userRepo interfaces.UserRepository,
) *Service {
	return &Service{
		visitReportRepo: visitReportRepo,
		accountRepo:     accountRepo,
		activityRepo:    activityRepo,
		userRepo:        userRepo,
	}
}

// GetVisitReportReport returns visit report report
func (s *Service) GetVisitReportReport(req *report.ReportRequest) (*report.VisitReportReportResponse, error) {
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
	} else {
		// Default to last 30 days
		end = time.Now()
		start = end.AddDate(0, 0, -30)
	}

	// Build list request
	listReq := &visit_report.ListVisitReportsRequest{
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
		Page:      1,
		PerPage:   10000,
	}

	if req.AccountID != "" {
		listReq.AccountID = req.AccountID
	}
	if req.SalesRepID != "" {
		listReq.SalesRepID = req.SalesRepID
	}
	if req.Status != "" {
		listReq.Status = req.Status
	}

	visitReports, _, err := s.visitReportRepo.List(listReq)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Calculate summary
	summary := struct {
		Total     int
		Completed int
		Pending   int
		Approved  int
		Rejected  int
	}{}

	byAccount := make(map[string]int)
	bySalesRep := make(map[string]int)
	byDate := make(map[string]int)
	byStatus := make(map[string]int)

	for _, vr := range visitReports {
		summary.Total++
		byStatus[vr.Status]++

		switch vr.Status {
		case "submitted", "approved":
			summary.Completed++
			if vr.Status == "approved" {
				summary.Approved++
			}
		case "draft":
			summary.Pending++
		case "rejected":
			summary.Rejected++
		}

		byAccount[vr.AccountID]++
		bySalesRep[vr.SalesRepID]++
		dateKey := vr.VisitDate.Format("2006-01-02")
		byDate[dateKey]++
	}

	// Build by account stats
	accountStats := make([]report.AccountStat, 0)
	for accountID, count := range byAccount {
		account, err := s.accountRepo.FindByID(accountID)
		if err == nil {
			accountStats = append(accountStats, report.AccountStat{
				Account: struct {
					ID   string `json:"id"`
					Name string `json:"name"`
				}{
					ID:   account.ID,
					Name: account.Name,
				},
				VisitCount: count,
			})
		}
	}

	// Build by sales rep stats
	salesRepStats := make([]report.SalesRepStat, 0)
	for salesRepID, count := range bySalesRep {
		user, err := s.userRepo.FindByID(salesRepID)
		if err == nil {
			salesRepStats = append(salesRepStats, report.SalesRepStat{
				SalesRep: struct {
					ID   string `json:"id"`
					Name string `json:"name"`
				}{
					ID:   user.ID,
					Name: user.Name,
				},
				VisitCount: count,
			})
		}
	}

	// Build by date stats
	dateStats := make([]report.DateStat, 0, len(byDate))
	for date, count := range byDate {
		dateStats = append(dateStats, report.DateStat{
			Date:  date,
			Count: count,
		})
	}

	response := &report.VisitReportReportResponse{
		Period: struct {
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
		}{
			Start: start,
			End:   end,
		},
		Summary: struct {
			Total     int `json:"total"`
			Completed int `json:"completed"`
			Pending   int `json:"pending"`
			Approved  int `json:"approved"`
			Rejected  int `json:"rejected"`
		}{
			Total:     summary.Total,
			Completed: summary.Completed,
			Pending:   summary.Pending,
			Approved:  summary.Approved,
			Rejected:  summary.Rejected,
		},
		ByAccount:  accountStats,
		BySalesRep: salesRepStats,
		ByDate:     dateStats,
		ByStatus:   byStatus,
	}

	return response, nil
}

// GetPipelineReport returns pipeline report (placeholder for future)
func (s *Service) GetPipelineReport(req *report.ReportRequest) (*report.PipelineReportResponse, error) {
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
	} else {
		// Default to last 30 days
		end = time.Now()
		start = end.AddDate(0, 0, -30)
	}

	// Placeholder implementation
	response := &report.PipelineReportResponse{
		Period: struct {
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
		}{
			Start: start,
			End:   end,
		},
		Summary: struct {
			TotalDeals int     `json:"total_deals"`
			TotalValue float64 `json:"total_value"`
			WonDeals   int     `json:"won_deals"`
			LostDeals  int     `json:"lost_deals"`
		}{
			TotalDeals: 0,
			TotalValue: 0,
			WonDeals:   0,
			LostDeals:  0,
		},
		ByStage: make(map[string]int),
	}

	return response, nil
}

// GetSalesPerformanceReport returns sales performance report
func (s *Service) GetSalesPerformanceReport(req *report.ReportRequest) (*report.SalesPerformanceReportResponse, error) {
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
	} else {
		// Default to last 30 days
		end = time.Now()
		start = end.AddDate(0, 0, -30)
	}

	// Get visit reports
	listReq := &visit_report.ListVisitReportsRequest{
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
		Page:      1,
		PerPage:   10000,
	}

	if req.SalesRepID != "" {
		listReq.SalesRepID = req.SalesRepID
	}

	visitReports, _, err := s.visitReportRepo.List(listReq)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
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

	// Count by sales rep
	salesRepVisitCount := make(map[string]int)
	salesRepAccountSet := make(map[string]map[string]bool)
	salesRepActivityCount := make(map[string]int)

	for _, vr := range visitReports {
		salesRepVisitCount[vr.SalesRepID]++
		if salesRepAccountSet[vr.SalesRepID] == nil {
			salesRepAccountSet[vr.SalesRepID] = make(map[string]bool)
		}
		salesRepAccountSet[vr.SalesRepID][vr.AccountID] = true
	}

	for _, act := range activities {
		salesRepActivityCount[act.UserID]++
	}

	// Build performance stats
	performanceStats := make([]report.SalesPerformanceStat, 0)
	for salesRepID, visitCount := range salesRepVisitCount {
		user, err := s.userRepo.FindByID(salesRepID)
		if err == nil {
			accountCount := len(salesRepAccountSet[salesRepID])
			activityCount := salesRepActivityCount[salesRepID]

			// Calculate completion rate (visits with approved status)
			approvedCount := 0
			for _, vr := range visitReports {
				if vr.SalesRepID == salesRepID && vr.Status == "approved" {
					approvedCount++
				}
			}
			completionRate := 0.0
			if visitCount > 0 {
				completionRate = float64(approvedCount) / float64(visitCount) * 100
			}

			performanceStats = append(performanceStats, report.SalesPerformanceStat{
				SalesRep: struct {
					ID   string `json:"id"`
					Name string `json:"name"`
					Email string `json:"email"`
				}{
					ID:   user.ID,
					Name: user.Name,
					Email: user.Email,
				},
				VisitCount:     visitCount,
				AccountCount:   accountCount,
				ActivityCount:  activityCount,
				CompletionRate: completionRate,
			})
		}
	}

	// Calculate summary
	totalVisits := len(visitReports)
	totalAccounts := 0
	accountSet := make(map[string]bool)
	for _, vr := range visitReports {
		accountSet[vr.AccountID] = true
	}
	totalAccounts = len(accountSet)

	averageVisitsPerAccount := 0.0
	if totalAccounts > 0 {
		averageVisitsPerAccount = float64(totalVisits) / float64(totalAccounts)
	}

	response := &report.SalesPerformanceReportResponse{
		Period: struct {
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
		}{
			Start: start,
			End:   end,
		},
		BySalesRep: performanceStats,
		Summary: struct {
			TotalVisits            int     `json:"total_visits"`
			TotalAccounts          int     `json:"total_accounts"`
			AverageVisitsPerAccount float64 `json:"average_visits_per_account"`
		}{
			TotalVisits:            totalVisits,
			TotalAccounts:          totalAccounts,
			AverageVisitsPerAccount: averageVisitsPerAccount,
		},
	}

	return response, nil
}

// GetAccountActivityReport returns account activity report
func (s *Service) GetAccountActivityReport(req *report.ReportRequest) (*report.AccountActivityReportResponse, error) {
	if req.AccountID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	// Get account
	account, err := s.accountRepo.FindByID(req.AccountID)
	if err != nil {
		return nil, err
	}

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
	} else {
		// Default to last 30 days
		end = time.Now()
		start = end.AddDate(0, 0, -30)
	}

	// Get visit reports for account
	visitReports, _, err := s.visitReportRepo.List(&visit_report.ListVisitReportsRequest{
		AccountID: req.AccountID,
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
		Page:      1,
		PerPage:   10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Get activities for account
	activities, _, err := s.activityRepo.List(&activity.ListActivitiesRequest{
		AccountID: req.AccountID,
		StartDate: start.Format("2006-01-02"),
		EndDate:   end.Format("2006-01-02"),
		Page:      1,
		PerPage:   10000,
	})
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Count contacts
	contactSet := make(map[string]bool)
	for _, vr := range visitReports {
		if vr.ContactID != nil {
			contactSet[*vr.ContactID] = true
		}
	}
	for _, act := range activities {
		if act.ContactID != nil {
			contactSet[*act.ContactID] = true
		}
	}

	// Build activity details
	activityDetails := make([]report.ActivityDetail, 0, len(activities))
	for _, act := range activities {
		user, _ := s.userRepo.FindByID(act.UserID)
		activityDetails = append(activityDetails, report.ActivityDetail{
			ID:          act.ID,
			Type:        act.Type,
			Description: act.Description,
			Timestamp:   act.Timestamp,
			User: struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			}{
				ID:   act.UserID,
				Name: func() string {
					if user != nil {
						return user.Name
					}
					return ""
				}(),
			},
		})
	}

	// Build visit details
	visitDetails := make([]report.VisitDetail, 0, len(visitReports))
	for _, vr := range visitReports {
		user, _ := s.userRepo.FindByID(vr.SalesRepID)
		visitDetails = append(visitDetails, report.VisitDetail{
			ID:        vr.ID,
			VisitDate: vr.VisitDate,
			Purpose:   vr.Purpose,
			Status:    vr.Status,
			SalesRep: struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			}{
				ID:   vr.SalesRepID,
				Name: func() string {
					if user != nil {
						return user.Name
					}
					return ""
				}(),
			},
		})
	}

	response := &report.AccountActivityReportResponse{
		Period: struct {
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
		}{
			Start: start,
			End:   end,
		},
		AccountID:   account.ID,
		AccountName: account.Name,
		Summary: struct {
			TotalVisits     int `json:"total_visits"`
			TotalActivities int `json:"total_activities"`
			TotalContacts   int `json:"total_contacts"`
		}{
			TotalVisits:     len(visitReports),
			TotalActivities: len(activities),
			TotalContacts:   len(contactSet),
		},
		Activities: activityDetails,
		Visits:     visitDetails,
	}

	return response, nil
}

