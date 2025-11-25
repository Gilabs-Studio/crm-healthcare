package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
)

// VisitReportRepository defines the interface for visit report repository
type VisitReportRepository interface {
	// FindByID finds a visit report by ID
	FindByID(id string) (*visit_report.VisitReport, error)
	
	// List returns a list of visit reports with pagination
	List(req *visit_report.ListVisitReportsRequest) ([]visit_report.VisitReport, int64, error)
	
	// Create creates a new visit report
	Create(vr *visit_report.VisitReport) error
	
	// Update updates a visit report
	Update(vr *visit_report.VisitReport) error
	
	// Delete soft deletes a visit report
	Delete(id string) error
	
	// FindByAccountID finds visit reports by account ID
	FindByAccountID(accountID string) ([]visit_report.VisitReport, error)
	
	// FindBySalesRepID finds visit reports by sales rep ID
	FindBySalesRepID(salesRepID string) ([]visit_report.VisitReport, error)
}

