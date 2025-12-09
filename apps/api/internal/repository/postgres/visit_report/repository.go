package visit_report

import (
	"strings"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new visit report repository
func NewRepository(db *gorm.DB) interfaces.VisitReportRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*visit_report.VisitReport, error) {
	var vr visit_report.VisitReport
	err := r.db.Where("id = ?", id).First(&vr).Error
	if err != nil {
		return nil, err
	}
	return &vr, nil
}

func (r *repository) List(req *visit_report.ListVisitReportsRequest) ([]visit_report.VisitReport, int64, error) {
	var visitReports []visit_report.VisitReport
	var total int64

	query := r.db.Model(&visit_report.VisitReport{})

	// Apply filters
	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where(
			"LOWER(purpose) LIKE ? OR LOWER(notes) LIKE ?",
			search, search,
		)
	}

	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}

	if req.AccountID != "" {
		query = query.Where("account_id = ?", req.AccountID)
	} else {
		// If AccountID is empty, we need to handle NULL values correctly
		// This allows filtering for visit reports without account (qualification phase)
	}

	if req.DealID != "" {
		query = query.Where("deal_id = ?", req.DealID)
	}

	if req.LeadID != "" {
		query = query.Where("lead_id = ?", req.LeadID)
	}

	if req.SalesRepID != "" {
		query = query.Where("sales_rep_id = ?", req.SalesRepID)
	}

	// Date range filter
	if req.StartDate != "" {
		startDate, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			query = query.Where("visit_date >= ?", startDate)
		}
	}

	if req.EndDate != "" {
		endDate, err := time.Parse("2006-01-02", req.EndDate)
		if err == nil {
			// Add one day to include the end date
			endDate = endDate.Add(24 * time.Hour)
			query = query.Where("visit_date < ?", endDate)
		}
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	page := req.Page
	if page < 1 {
		page = 1
	}
	perPage := req.PerPage
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	offset := (page - 1) * perPage

	// Fetch data
	err := query.Order("visit_date DESC, created_at DESC").Offset(offset).Limit(perPage).Find(&visitReports).Error
	if err != nil {
		return nil, 0, err
	}

	return visitReports, total, nil
}

func (r *repository) Create(vr *visit_report.VisitReport) error {
	return r.db.Create(vr).Error
}

func (r *repository) Update(vr *visit_report.VisitReport) error {
	return r.db.Save(vr).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&visit_report.VisitReport{}).Error
}

func (r *repository) FindByAccountID(accountID string) ([]visit_report.VisitReport, error) {
	var visitReports []visit_report.VisitReport
	err := r.db.Where("account_id = ?", accountID).Order("visit_date DESC").Find(&visitReports).Error
	if err != nil {
		return nil, err
	}
	return visitReports, nil
}

func (r *repository) FindBySalesRepID(salesRepID string) ([]visit_report.VisitReport, error) {
	var visitReports []visit_report.VisitReport
	err := r.db.Where("sales_rep_id = ?", salesRepID).Order("visit_date DESC").Find(&visitReports).Error
	if err != nil {
		return nil, err
	}
	return visitReports, nil
}

