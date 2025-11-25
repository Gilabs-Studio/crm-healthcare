package report

import (
	"fmt"
	"strings"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
	"github.com/gilabs/crm-healthcare/api/internal/domain/report"
	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"github.com/xuri/excelize/v2"
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

// ExportVisitReportReport exports visit report report as CSV or Excel
func (s *Service) ExportVisitReportReport(req *report.ReportRequest, format string) ([]byte, string, error) {
	// Get report data
	reportData, err := s.GetVisitReportReport(req)
	if err != nil {
		return nil, "", err
	}

	// Generate filename
	filename := "visit-report-export.csv"
	if format == "excel" {
		filename = "visit-report-export.xlsx"
	}

	// Generate file based on format
	if format == "csv" {
		csvData := s.generateVisitReportCSV(reportData)
		return csvData, filename, nil
	} else {
		// Generate Excel with styling
		excelData, err := s.generateVisitReportExcel(reportData)
		if err != nil {
			return nil, "", err
		}
		return excelData, filename, nil
	}
}

// ExportPipelineReport exports pipeline report as CSV or Excel
func (s *Service) ExportPipelineReport(req *report.ReportRequest, format string) ([]byte, string, error) {
	// Get report data
	reportData, err := s.GetPipelineReport(req)
	if err != nil {
		return nil, "", err
	}

	// Generate filename
	filename := "pipeline-report-export.csv"
	if format == "excel" {
		filename = "pipeline-report-export.xlsx"
	}

	// Generate file based on format
	if format == "csv" {
		csvData := s.generatePipelineReportCSV(reportData)
		return csvData, filename, nil
	} else {
		// Generate Excel with styling
		excelData, err := s.generatePipelineReportExcel(reportData)
		if err != nil {
			return nil, "", err
		}
		return excelData, filename, nil
	}
}

// ExportSalesPerformanceReport exports sales performance report as CSV or Excel
func (s *Service) ExportSalesPerformanceReport(req *report.ReportRequest, format string) ([]byte, string, error) {
	// Get report data
	reportData, err := s.GetSalesPerformanceReport(req)
	if err != nil {
		return nil, "", err
	}

	// Generate filename
	filename := "sales-performance-report-export.csv"
	if format == "excel" {
		filename = "sales-performance-report-export.xlsx"
	}

	// Generate file based on format
	if format == "csv" {
		csvData := s.generateSalesPerformanceReportCSV(reportData)
		return csvData, filename, nil
	} else {
		// Generate Excel with styling
		excelData, err := s.generateSalesPerformanceReportExcel(reportData)
		if err != nil {
			return nil, "", err
		}
		return excelData, filename, nil
	}
}

// ExportAccountActivityReport exports account activity report as CSV or Excel
func (s *Service) ExportAccountActivityReport(req *report.ReportRequest, format string) ([]byte, string, error) {
	// Get report data
	reportData, err := s.GetAccountActivityReport(req)
	if err != nil {
		return nil, "", err
	}

	// Generate filename
	filename := "account-activity-report-export.csv"
	if format == "excel" {
		filename = "account-activity-report-export.xlsx"
	}

	// Generate file based on format
	if format == "csv" {
		csvData := s.generateAccountActivityReportCSV(reportData)
		return csvData, filename, nil
	} else {
		// Generate Excel with styling
		excelData, err := s.generateAccountActivityReportExcel(reportData)
		if err != nil {
			return nil, "", err
		}
		return excelData, filename, nil
	}
}

// generateVisitReportCSV generates CSV data for visit report
func (s *Service) generateVisitReportCSV(data *report.VisitReportReportResponse) []byte {
	var csv strings.Builder

	// Write header
	csv.WriteString("Period Start,Period End,Total,Completed,Pending,Approved,Rejected\n")
	csv.WriteString(fmt.Sprintf("%s,%s,%d,%d,%d,%d,%d\n",
		data.Period.Start.Format("2006-01-02"),
		data.Period.End.Format("2006-01-02"),
		data.Summary.Total,
		data.Summary.Completed,
		data.Summary.Pending,
		data.Summary.Approved,
		data.Summary.Rejected,
	))

	// Write by account
	csv.WriteString("\nBy Account\n")
	csv.WriteString("Account ID,Account Name,Visit Count\n")
	for _, stat := range data.ByAccount {
		csv.WriteString(fmt.Sprintf("%s,\"%s\",%d\n",
			stat.Account.ID,
			stat.Account.Name,
			stat.VisitCount,
		))
	}

	// Write by sales rep
	csv.WriteString("\nBy Sales Rep\n")
	csv.WriteString("Sales Rep ID,Sales Rep Name,Visit Count\n")
	for _, stat := range data.BySalesRep {
		csv.WriteString(fmt.Sprintf("%s,\"%s\",%d\n",
			stat.SalesRep.ID,
			stat.SalesRep.Name,
			stat.VisitCount,
		))
	}

	// Write by date
	csv.WriteString("\nBy Date\n")
	csv.WriteString("Date,Visit Count\n")
	for _, stat := range data.ByDate {
		csv.WriteString(fmt.Sprintf("%s,%d\n",
			stat.Date,
			stat.Count,
		))
	}

	return []byte(csv.String())
}

// generatePipelineReportCSV generates CSV data for pipeline report
func (s *Service) generatePipelineReportCSV(data *report.PipelineReportResponse) []byte {
	var csv strings.Builder

	// Write header
	csv.WriteString("Period Start,Period End,Total Deals,Total Value,Won Deals,Lost Deals\n")
	csv.WriteString(fmt.Sprintf("%s,%s,%d,%.2f,%d,%d\n",
		data.Period.Start.Format("2006-01-02"),
		data.Period.End.Format("2006-01-02"),
		data.Summary.TotalDeals,
		data.Summary.TotalValue,
		data.Summary.WonDeals,
		data.Summary.LostDeals,
	))

	// Write by stage
	csv.WriteString("\nBy Stage\n")
	csv.WriteString("Stage,Deal Count\n")
	for stage, count := range data.ByStage {
		csv.WriteString(fmt.Sprintf("\"%s\",%d\n",
			stage,
			count,
		))
	}

	return []byte(csv.String())
}

// generateSalesPerformanceReportCSV generates CSV data for sales performance report
func (s *Service) generateSalesPerformanceReportCSV(data *report.SalesPerformanceReportResponse) []byte {
	var csv strings.Builder

	// Write summary
	csv.WriteString("Period Start,Period End,Total Visits,Total Accounts,Average Visits Per Account\n")
	csv.WriteString(fmt.Sprintf("%s,%s,%d,%d,%.2f\n",
		data.Period.Start.Format("2006-01-02"),
		data.Period.End.Format("2006-01-02"),
		data.Summary.TotalVisits,
		data.Summary.TotalAccounts,
		data.Summary.AverageVisitsPerAccount,
	))

	// Write by sales rep
	csv.WriteString("\nBy Sales Rep\n")
	csv.WriteString("Sales Rep ID,Sales Rep Name,Email,Visit Count,Account Count,Activity Count,Completion Rate\n")
	for _, stat := range data.BySalesRep {
		csv.WriteString(fmt.Sprintf("%s,\"%s\",\"%s\",%d,%d,%d,%.2f%%\n",
			stat.SalesRep.ID,
			stat.SalesRep.Name,
			stat.SalesRep.Email,
			stat.VisitCount,
			stat.AccountCount,
			stat.ActivityCount,
			stat.CompletionRate,
		))
	}

	return []byte(csv.String())
}

// generateAccountActivityReportCSV generates CSV data for account activity report
func (s *Service) generateAccountActivityReportCSV(data *report.AccountActivityReportResponse) []byte {
	var csv strings.Builder

	// Write header
	csv.WriteString("Period Start,Period End,Account ID,Account Name,Total Visits,Total Activities,Total Contacts\n")
	csv.WriteString(fmt.Sprintf("%s,%s,%s,\"%s\",%d,%d,%d\n",
		data.Period.Start.Format("2006-01-02"),
		data.Period.End.Format("2006-01-02"),
		data.AccountID,
		data.AccountName,
		data.Summary.TotalVisits,
		data.Summary.TotalActivities,
		data.Summary.TotalContacts,
	))

	// Write visits
	csv.WriteString("\nVisits\n")
	csv.WriteString("Visit ID,Visit Date,Purpose,Status,Sales Rep ID,Sales Rep Name\n")
	for _, visit := range data.Visits {
		csv.WriteString(fmt.Sprintf("%s,%s,\"%s\",%s,%s,\"%s\"\n",
			visit.ID,
			visit.VisitDate.Format("2006-01-02 15:04:05"),
			visit.Purpose,
			visit.Status,
			visit.SalesRep.ID,
			visit.SalesRep.Name,
		))
	}

	// Write activities
	csv.WriteString("\nActivities\n")
	csv.WriteString("Activity ID,Type,Description,Timestamp,User ID,User Name\n")
	for _, activity := range data.Activities {
		csv.WriteString(fmt.Sprintf("%s,%s,\"%s\",%s,%s,\"%s\"\n",
			activity.ID,
			activity.Type,
			activity.Description,
			activity.Timestamp.Format("2006-01-02 15:04:05"),
			activity.User.ID,
			activity.User.Name,
		))
	}

	return []byte(csv.String())
}

// createExcelHeaderStyle creates header style for Excel
func createExcelHeaderStyle(f *excelize.File) (int, error) {
	return f.NewStyle(&excelize.Style{
		Fill: excelize.Fill{Type: "pattern", Color: []string{"#1E40AF"}, Pattern: 1},
		Font: &excelize.Font{Bold: true, Color: "#FFFFFF", Size: 11},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center", WrapText: true},
		Border: []excelize.Border{
			{Type: "left", Color: "#000000", Style: 1},
			{Type: "top", Color: "#000000", Style: 1},
			{Type: "bottom", Color: "#000000", Style: 1},
			{Type: "right", Color: "#000000", Style: 1},
		},
	})
}

// createExcelTitleStyle creates title style for Excel
func createExcelTitleStyle(f *excelize.File) (int, error) {
	return f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Size: 16},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
	})
}

// createExcelSubtitleStyle creates subtitle style for Excel
func createExcelSubtitleStyle(f *excelize.File) (int, error) {
	return f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Size: 12},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"#E5E7EB"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
	})
}

// createExcelDataStyle creates data style for Excel
func createExcelDataStyle(f *excelize.File) (int, error) {
	return f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Size: 10},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "#D1D5DB", Style: 1},
			{Type: "top", Color: "#D1D5DB", Style: 1},
			{Type: "bottom", Color: "#D1D5DB", Style: 1},
			{Type: "right", Color: "#D1D5DB", Style: 1},
		},
	})
}

// createExcelNumberStyle creates number style for Excel
func createExcelNumberStyle(f *excelize.File) (int, error) {
	return f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Size: 10},
		Alignment: &excelize.Alignment{Horizontal: "right", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "#D1D5DB", Style: 1},
			{Type: "top", Color: "#D1D5DB", Style: 1},
			{Type: "bottom", Color: "#D1D5DB", Style: 1},
			{Type: "right", Color: "#D1D5DB", Style: 1},
		},
	})
}

// generateVisitReportExcel generates Excel file for visit report with professional styling
func (s *Service) generateVisitReportExcel(data *report.VisitReportReportResponse) ([]byte, error) {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Printf("Error closing file: %v\n", err)
		}
	}()

	sheetName := "Visit Report"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(index)
	f.DeleteSheet("Sheet1")

	// Create styles
	titleStyle, _ := createExcelTitleStyle(f)
	subtitleStyle, _ := createExcelSubtitleStyle(f)
	headerStyle, _ := createExcelHeaderStyle(f)
	dataStyle, _ := createExcelDataStyle(f)
	numberStyle, _ := createExcelNumberStyle(f)

	row := 1

	// Title
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "Visit Report")
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), titleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row++

	// Period
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("Period: %s to %s",
		data.Period.Start.Format("2006-01-02"),
		data.Period.End.Format("2006-01-02")))
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row += 2

	// Summary Section
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "Summary")
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row++

	// Summary Headers
	summaryHeaders := []string{"Total", "Completed", "Pending", "Approved", "Rejected"}
	for i, header := range summaryHeaders {
		cell := fmt.Sprintf("%c%d", 'A'+i, row)
		f.SetCellValue(sheetName, cell, header)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}
	row++

	// Summary Data
	summaryData := []interface{}{data.Summary.Total, data.Summary.Completed, data.Summary.Pending, data.Summary.Approved, data.Summary.Rejected}
	for i, value := range summaryData {
		cell := fmt.Sprintf("%c%d", 'A'+i, row)
		f.SetCellValue(sheetName, cell, value)
		f.SetCellStyle(sheetName, cell, cell, numberStyle)
	}
	row += 2

	// By Account Section
	if len(data.ByAccount) > 0 {
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "By Account")
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
		f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("C%d", row))
		row++

		// Headers
		accountHeaders := []string{"Account ID", "Account Name", "Visit Count"}
		for i, header := range accountHeaders {
			cell := fmt.Sprintf("%c%d", 'A'+i, row)
			f.SetCellValue(sheetName, cell, header)
			f.SetCellStyle(sheetName, cell, cell, headerStyle)
		}
		row++

		// Data
		for _, stat := range data.ByAccount {
			f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), stat.Account.ID)
			f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), stat.Account.Name)
			f.SetCellStyle(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), stat.VisitCount)
			f.SetCellStyle(sheetName, fmt.Sprintf("C%d", row), fmt.Sprintf("C%d", row), numberStyle)
			row++
		}
		row += 2
	}

	// By Sales Rep Section
	if len(data.BySalesRep) > 0 {
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "By Sales Rep")
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
		f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("C%d", row))
		row++

		// Headers
		salesRepHeaders := []string{"Sales Rep ID", "Sales Rep Name", "Visit Count"}
		for i, header := range salesRepHeaders {
			cell := fmt.Sprintf("%c%d", 'A'+i, row)
			f.SetCellValue(sheetName, cell, header)
			f.SetCellStyle(sheetName, cell, cell, headerStyle)
		}
		row++

		// Data
		for _, stat := range data.BySalesRep {
			f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), stat.SalesRep.ID)
			f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), stat.SalesRep.Name)
			f.SetCellStyle(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), stat.VisitCount)
			f.SetCellStyle(sheetName, fmt.Sprintf("C%d", row), fmt.Sprintf("C%d", row), numberStyle)
			row++
		}
		row += 2
	}

	// By Date Section
	if len(data.ByDate) > 0 {
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "By Date")
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
		f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("B%d", row))
		row++

		// Headers
		dateHeaders := []string{"Date", "Visit Count"}
		for i, header := range dateHeaders {
			cell := fmt.Sprintf("%c%d", 'A'+i, row)
			f.SetCellValue(sheetName, cell, header)
			f.SetCellStyle(sheetName, cell, cell, headerStyle)
		}
		row++

		// Data
		for _, stat := range data.ByDate {
			f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), stat.Date)
			f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), stat.Count)
			f.SetCellStyle(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), numberStyle)
			row++
		}
	}

	// Auto-fit columns
	for i := 0; i < 7; i++ {
		col := string(rune('A' + i))
		f.SetColWidth(sheetName, col, col, 15)
	}

	// Save to buffer
	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// generatePipelineReportExcel generates Excel file for pipeline report with 2 tabs: Sales Funnel and Insights
func (s *Service) generatePipelineReportExcel(data *report.PipelineReportResponse) ([]byte, error) {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Printf("Error closing file: %v\n", err)
		}
	}()

	// Delete default sheet
	f.DeleteSheet("Sheet1")

	// Create styles
	titleStyle, _ := createExcelTitleStyle(f)
	subtitleStyle, _ := createExcelSubtitleStyle(f)
	headerStyle, _ := createExcelHeaderStyle(f)
	dataStyle, _ := createExcelDataStyle(f)
	numberStyle, _ := createExcelNumberStyle(f)
	
	// Create grand total style (red background)
	grandTotalStyle, _ := f.NewStyle(&excelize.Style{
		Fill: excelize.Fill{Type: "pattern", Color: []string{"#FEE2E2"}, Pattern: 1}, // Light red
		Font: &excelize.Font{Bold: true, Size: 10, Color: "#991B1B"}, // Dark red text
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "#000000", Style: 1},
			{Type: "top", Color: "#000000", Style: 1},
			{Type: "bottom", Color: "#000000", Style: 1},
			{Type: "right", Color: "#000000", Style: 1},
		},
	})
	grandTotalNumberStyle, _ := f.NewStyle(&excelize.Style{
		Fill: excelize.Fill{Type: "pattern", Color: []string{"#FEE2E2"}, Pattern: 1},
		Font: &excelize.Font{Bold: true, Size: 10, Color: "#991B1B"},
		Alignment: &excelize.Alignment{Horizontal: "right", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "#000000", Style: 1},
			{Type: "top", Color: "#000000", Style: 1},
			{Type: "bottom", Color: "#000000", Style: 1},
			{Type: "right", Color: "#000000", Style: 1},
		},
	})

	// ===== TAB 1: Sales Funnel =====
	sheet1Name := "Sales Funnel"
	sheet1Index, err := f.NewSheet(sheet1Name)
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(sheet1Index)

	row := 1

	// Title
	f.SetCellValue(sheet1Name, fmt.Sprintf("A%d", row), "Sales Funnel")
	f.SetCellStyle(sheet1Name, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), titleStyle)
	f.MergeCell(sheet1Name, fmt.Sprintf("A%d", row), fmt.Sprintf("M%d", row))
	row++

	// Period
	f.SetCellValue(sheet1Name, fmt.Sprintf("A%d", row), fmt.Sprintf("Period: %s to %s",
		data.Period.Start.Format("2006-01-02"),
		data.Period.End.Format("2006-01-02")))
	f.SetCellStyle(sheet1Name, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheet1Name, fmt.Sprintf("A%d", row), fmt.Sprintf("M%d", row))
	row += 2

	// Table Headers
	headers := []string{"Company Name", "Contact Name", "Contact Email", "Stage", "Value", "Probability", "Expected Revenue", "Creation Date", "Expected Close Date", "Team Member", "Progress to Won", "Last Interacted On", "Next Step"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c%d", 'A'+i, row)
		f.SetCellValue(sheet1Name, cell, header)
		f.SetCellStyle(sheet1Name, cell, cell, headerStyle)
	}
	row++

	// Grand Total Row (red background)
	f.SetCellValue(sheet1Name, fmt.Sprintf("A%d", row), "GRAND TOTAL")
	f.SetCellStyle(sheet1Name, fmt.Sprintf("A%d", row), fmt.Sprintf("D%d", row), grandTotalStyle)
	f.MergeCell(sheet1Name, fmt.Sprintf("A%d", row), fmt.Sprintf("D%d", row))
	
	// Grand Total Value
	f.SetCellValue(sheet1Name, fmt.Sprintf("E%d", row), data.Summary.TotalValue)
	f.SetCellStyle(sheet1Name, fmt.Sprintf("E%d", row), fmt.Sprintf("E%d", row), grandTotalNumberStyle)
	
	// Probability column (empty for grand total)
	f.SetCellValue(sheet1Name, fmt.Sprintf("F%d", row), "")
	f.SetCellStyle(sheet1Name, fmt.Sprintf("F%d", row), fmt.Sprintf("F%d", row), grandTotalStyle)
	
	// Expected Revenue (placeholder - will be calculated when deals are available)
	expectedRevenue := data.Summary.TotalValue * 0.5 // Placeholder calculation
	f.SetCellValue(sheet1Name, fmt.Sprintf("G%d", row), expectedRevenue)
	f.SetCellStyle(sheet1Name, fmt.Sprintf("G%d", row), fmt.Sprintf("G%d", row), grandTotalNumberStyle)
	
	// Empty cells for remaining columns
	for i := 7; i < 13; i++ {
		cell := fmt.Sprintf("%c%d", 'A'+i, row)
		f.SetCellValue(sheet1Name, cell, "")
		f.SetCellStyle(sheet1Name, cell, cell, grandTotalStyle)
	}
	row++

	// Note: Individual deal rows will be added when Deal API is available (Sprint 2)
	// For now, we show a placeholder message
	f.SetCellValue(sheet1Name, fmt.Sprintf("A%d", row), "Note: Individual deal data will be available after Sales Pipeline module is implemented (Sprint 2)")
	f.SetCellStyle(sheet1Name, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dataStyle)
	f.MergeCell(sheet1Name, fmt.Sprintf("A%d", row), fmt.Sprintf("M%d", row))
	row++

	// Auto-fit columns for Sales Funnel tab
	for i := 0; i < 13; i++ {
		col := string(rune('A' + i))
		width := 15.0
		if i == 0 || i == 2 { // Company Name, Contact Email
			width = 25.0
		} else if i == 11 || i == 12 { // Last Interacted On, Next Step
			width = 20.0
		}
		f.SetColWidth(sheet1Name, col, col, width)
	}

	// ===== TAB 2: Insights =====
	sheet2Name := "Insights"
	_, err = f.NewSheet(sheet2Name)
	if err != nil {
		return nil, err
	}

	row = 1

	// Title
	f.SetCellValue(sheet2Name, fmt.Sprintf("A%d", row), "Insights")
	f.SetCellStyle(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), titleStyle)
	f.MergeCell(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("F%d", row))
	row++

	// Period
	f.SetCellValue(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("Period: %s to %s",
		data.Period.Start.Format("2006-01-02"),
		data.Period.End.Format("2006-01-02")))
	f.SetCellStyle(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("F%d", row))
	row += 2

	// Key Metrics Section
	f.SetCellValue(sheet2Name, fmt.Sprintf("A%d", row), "Key Metrics")
	f.SetCellStyle(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("F%d", row))
	row++

	// Metrics Headers
	metricsHeaders := []string{"Metric", "Value"}
	for i, header := range metricsHeaders {
		cell := fmt.Sprintf("%c%d", 'A'+i, row)
		f.SetCellValue(sheet2Name, cell, header)
		f.SetCellStyle(sheet2Name, cell, cell, headerStyle)
	}
	row++

	// Calculate metrics
	winRate := 0.0
	if data.Summary.TotalDeals > 0 {
		winRate = (float64(data.Summary.WonDeals) / float64(data.Summary.TotalDeals)) * 100
	}
	avgDealValue := 0.0
	if data.Summary.TotalDeals > 0 {
		avgDealValue = data.Summary.TotalValue / float64(data.Summary.TotalDeals)
	}

	// Metrics Data
	metrics := []struct {
		label string
		value interface{}
	}{
		{"Win Rate", fmt.Sprintf("%.1f%%", winRate)},
		{"Average Deal Value", avgDealValue},
		{"Total Pipeline Value", data.Summary.TotalValue},
		{"Lost Deals", data.Summary.LostDeals},
	}

	for _, metric := range metrics {
		f.SetCellValue(sheet2Name, fmt.Sprintf("A%d", row), metric.label)
		f.SetCellStyle(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dataStyle)
		
		if metric.label == "Average Deal Value" || metric.label == "Total Pipeline Value" {
			f.SetCellValue(sheet2Name, fmt.Sprintf("B%d", row), metric.value)
			f.SetCellStyle(sheet2Name, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), numberStyle)
		} else {
			f.SetCellValue(sheet2Name, fmt.Sprintf("B%d", row), metric.value)
			f.SetCellStyle(sheet2Name, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), dataStyle)
		}
		row++
	}
	row += 2

	// Stage Breakdown Section
	if len(data.ByStage) > 0 {
		f.SetCellValue(sheet2Name, fmt.Sprintf("A%d", row), "Stage Breakdown")
		f.SetCellStyle(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
		f.MergeCell(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("F%d", row))
		row++

		// Headers
		stageHeaders := []string{"Stage", "Deal Count", "Percentage"}
		for i, header := range stageHeaders {
			cell := fmt.Sprintf("%c%d", 'A'+i, row)
			f.SetCellValue(sheet2Name, cell, header)
			f.SetCellStyle(sheet2Name, cell, cell, headerStyle)
		}
		row++

		// Data
		for stage, count := range data.ByStage {
			percentage := 0.0
			if data.Summary.TotalDeals > 0 {
				percentage = (float64(count) / float64(data.Summary.TotalDeals)) * 100
			}
			
			f.SetCellValue(sheet2Name, fmt.Sprintf("A%d", row), strings.ReplaceAll(stage, "_", " "))
			f.SetCellStyle(sheet2Name, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dataStyle)
			f.SetCellValue(sheet2Name, fmt.Sprintf("B%d", row), count)
			f.SetCellStyle(sheet2Name, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), numberStyle)
			f.SetCellValue(sheet2Name, fmt.Sprintf("C%d", row), fmt.Sprintf("%.1f%%", percentage))
			f.SetCellStyle(sheet2Name, fmt.Sprintf("C%d", row), fmt.Sprintf("C%d", row), numberStyle)
			row++
		}
	}

	// Auto-fit columns for Insights tab
	for i := 0; i < 6; i++ {
		col := string(rune('A' + i))
		f.SetColWidth(sheet2Name, col, col, 20)
	}

	// Set Sales Funnel as active sheet
	f.SetActiveSheet(sheet1Index)

	// Save to buffer
	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// generateSalesPerformanceReportExcel generates Excel file for sales performance report with professional styling
func (s *Service) generateSalesPerformanceReportExcel(data *report.SalesPerformanceReportResponse) ([]byte, error) {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Printf("Error closing file: %v\n", err)
		}
	}()

	sheetName := "Sales Performance"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(index)
	f.DeleteSheet("Sheet1")

	// Create styles
	titleStyle, _ := createExcelTitleStyle(f)
	subtitleStyle, _ := createExcelSubtitleStyle(f)
	headerStyle, _ := createExcelHeaderStyle(f)
	dataStyle, _ := createExcelDataStyle(f)
	numberStyle, _ := createExcelNumberStyle(f)

	row := 1

	// Title
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "Sales Performance Report")
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), titleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row++

	// Period
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("Period: %s to %s",
		data.Period.Start.Format("2006-01-02"),
		data.Period.End.Format("2006-01-02")))
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row += 2

	// Summary Section
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "Summary")
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row++

	// Summary Headers
	summaryHeaders := []string{"Total Visits", "Total Accounts", "Average Visits Per Account"}
	for i, header := range summaryHeaders {
		cell := fmt.Sprintf("%c%d", 'A'+i, row)
		f.SetCellValue(sheetName, cell, header)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}
	row++

	// Summary Data
	summaryData := []interface{}{data.Summary.TotalVisits, data.Summary.TotalAccounts, data.Summary.AverageVisitsPerAccount}
	for i, value := range summaryData {
		cell := fmt.Sprintf("%c%d", 'A'+i, row)
		f.SetCellValue(sheetName, cell, value)
		f.SetCellStyle(sheetName, cell, cell, numberStyle)
	}
	row += 2

	// By Sales Rep Section
	if len(data.BySalesRep) > 0 {
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "By Sales Rep")
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
		f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
		row++

		// Headers
		salesRepHeaders := []string{"Sales Rep ID", "Sales Rep Name", "Email", "Visit Count", "Account Count", "Activity Count", "Completion Rate (%)"}
		for i, header := range salesRepHeaders {
			cell := fmt.Sprintf("%c%d", 'A'+i, row)
			f.SetCellValue(sheetName, cell, header)
			f.SetCellStyle(sheetName, cell, cell, headerStyle)
		}
		row++

		// Data
		for _, stat := range data.BySalesRep {
			f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), stat.SalesRep.ID)
			f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), stat.SalesRep.Name)
			f.SetCellStyle(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), stat.SalesRep.Email)
			f.SetCellStyle(sheetName, fmt.Sprintf("C%d", row), fmt.Sprintf("C%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), stat.VisitCount)
			f.SetCellStyle(sheetName, fmt.Sprintf("D%d", row), fmt.Sprintf("D%d", row), numberStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), stat.AccountCount)
			f.SetCellStyle(sheetName, fmt.Sprintf("E%d", row), fmt.Sprintf("E%d", row), numberStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("F%d", row), stat.ActivityCount)
			f.SetCellStyle(sheetName, fmt.Sprintf("F%d", row), fmt.Sprintf("F%d", row), numberStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("G%d", row), fmt.Sprintf("%.2f%%", stat.CompletionRate))
			f.SetCellStyle(sheetName, fmt.Sprintf("G%d", row), fmt.Sprintf("G%d", row), numberStyle)
			row++
		}
	}

	// Auto-fit columns
	for i := 0; i < 7; i++ {
		col := string(rune('A' + i))
		f.SetColWidth(sheetName, col, col, 18)
	}

	// Save to buffer
	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// generateAccountActivityReportExcel generates Excel file for account activity report with professional styling
func (s *Service) generateAccountActivityReportExcel(data *report.AccountActivityReportResponse) ([]byte, error) {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Printf("Error closing file: %v\n", err)
		}
	}()

	sheetName := "Account Activity"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		return nil, err
	}
	f.SetActiveSheet(index)
	f.DeleteSheet("Sheet1")

	// Create styles
	titleStyle, _ := createExcelTitleStyle(f)
	subtitleStyle, _ := createExcelSubtitleStyle(f)
	headerStyle, _ := createExcelHeaderStyle(f)
	dataStyle, _ := createExcelDataStyle(f)
	numberStyle, _ := createExcelNumberStyle(f)

	row := 1

	// Title
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "Account Activity Report")
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), titleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row++

	// Account Info
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("Account: %s (%s)",
		data.AccountName, data.AccountID))
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row++

	// Period
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("Period: %s to %s",
		data.Period.Start.Format("2006-01-02"),
		data.Period.End.Format("2006-01-02")))
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row += 2

	// Summary Section
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "Summary")
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
	f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("G%d", row))
	row++

	// Summary Headers
	summaryHeaders := []string{"Total Visits", "Total Activities", "Total Contacts"}
	for i, header := range summaryHeaders {
		cell := fmt.Sprintf("%c%d", 'A'+i, row)
		f.SetCellValue(sheetName, cell, header)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}
	row++

	// Summary Data
	summaryData := []interface{}{data.Summary.TotalVisits, data.Summary.TotalActivities, data.Summary.TotalContacts}
	for i, value := range summaryData {
		cell := fmt.Sprintf("%c%d", 'A'+i, row)
		f.SetCellValue(sheetName, cell, value)
		f.SetCellStyle(sheetName, cell, cell, numberStyle)
	}
	row += 2

	// Visits Section
	if len(data.Visits) > 0 {
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "Visits")
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
		f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("F%d", row))
		row++

		// Headers
		visitHeaders := []string{"Visit ID", "Visit Date", "Purpose", "Status", "Sales Rep ID", "Sales Rep Name"}
		for i, header := range visitHeaders {
			cell := fmt.Sprintf("%c%d", 'A'+i, row)
			f.SetCellValue(sheetName, cell, header)
			f.SetCellStyle(sheetName, cell, cell, headerStyle)
		}
		row++

		// Data
		for _, visit := range data.Visits {
			f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), visit.ID)
			f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), visit.VisitDate.Format("2006-01-02 15:04:05"))
			f.SetCellStyle(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), visit.Purpose)
			f.SetCellStyle(sheetName, fmt.Sprintf("C%d", row), fmt.Sprintf("C%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), visit.Status)
			f.SetCellStyle(sheetName, fmt.Sprintf("D%d", row), fmt.Sprintf("D%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), visit.SalesRep.ID)
			f.SetCellStyle(sheetName, fmt.Sprintf("E%d", row), fmt.Sprintf("E%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("F%d", row), visit.SalesRep.Name)
			f.SetCellStyle(sheetName, fmt.Sprintf("F%d", row), fmt.Sprintf("F%d", row), dataStyle)
			row++
		}
		row += 2
	}

	// Activities Section
	if len(data.Activities) > 0 {
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), "Activities")
		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), subtitleStyle)
		f.MergeCell(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("F%d", row))
		row++

		// Headers
		activityHeaders := []string{"Activity ID", "Type", "Description", "Timestamp", "User ID", "User Name"}
		for i, header := range activityHeaders {
			cell := fmt.Sprintf("%c%d", 'A'+i, row)
			f.SetCellValue(sheetName, cell, header)
			f.SetCellStyle(sheetName, cell, cell, headerStyle)
		}
		row++

		// Data
		for _, activity := range data.Activities {
			f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), activity.ID)
			f.SetCellStyle(sheetName, fmt.Sprintf("A%d", row), fmt.Sprintf("A%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), activity.Type)
			f.SetCellStyle(sheetName, fmt.Sprintf("B%d", row), fmt.Sprintf("B%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), activity.Description)
			f.SetCellStyle(sheetName, fmt.Sprintf("C%d", row), fmt.Sprintf("C%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), activity.Timestamp.Format("2006-01-02 15:04:05"))
			f.SetCellStyle(sheetName, fmt.Sprintf("D%d", row), fmt.Sprintf("D%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), activity.User.ID)
			f.SetCellStyle(sheetName, fmt.Sprintf("E%d", row), fmt.Sprintf("E%d", row), dataStyle)
			f.SetCellValue(sheetName, fmt.Sprintf("F%d", row), activity.User.Name)
			f.SetCellStyle(sheetName, fmt.Sprintf("F%d", row), fmt.Sprintf("F%d", row), dataStyle)
			row++
		}
	}

	// Auto-fit columns
	for i := 0; i < 7; i++ {
		col := string(rune('A' + i))
		f.SetColWidth(sheetName, col, col, 18)
	}

	// Save to buffer
	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}


