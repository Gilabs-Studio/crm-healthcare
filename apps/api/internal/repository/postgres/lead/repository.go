package lead

import (
	"fmt"
	"strings"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/lead"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new lead repository
func NewRepository(db *gorm.DB) interfaces.LeadRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*lead.Lead, error) {
	var l lead.Lead
	err := r.db.
		Preload("AssignedUser").
		Preload("Account").
		Preload("Contact").
		Preload("Opportunity").
		Where("id = ?", id).
		First(&l).Error
	if err != nil {
		return nil, err
	}
	return &l, nil
}

func (r *repository) List(req *lead.ListLeadsRequest) ([]lead.Lead, int64, error) {
	var leads []lead.Lead
	var total int64

	query := r.db.Model(&lead.Lead{})

	// Apply filters
	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where(
			"LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(company_name) LIKE ? OR LOWER(phone) LIKE ?",
			search, search, search, search, search,
		)
	}

	if req.Status != "" {
		query = query.Where("lead_status = ?", req.Status)
	}

	if req.Source != "" {
		query = query.Where("lead_source = ?", req.Source)
	}

	if req.AssignedTo != "" {
		query = query.Where("assigned_to = ?", req.AssignedTo)
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

	// Determine sort field and order
	sortField := "created_at"
	if req.Sort != "" {
		sortField = req.Sort
	}
	sortOrder := "DESC"
	if req.Order == "asc" {
		sortOrder = "ASC"
	}

	// Fetch data with preload
	err := query.
		Preload("AssignedUser").
		Preload("Account").
		Preload("Contact").
		Preload("Opportunity").
		Order(fmt.Sprintf("%s %s", sortField, sortOrder)).
		Offset(offset).
		Limit(perPage).
		Find(&leads).Error
	if err != nil {
		return nil, 0, err
	}

	return leads, total, nil
}

func (r *repository) Create(l *lead.Lead) error {
	return r.db.Create(l).Error
}

func (r *repository) Update(l *lead.Lead) error {
	// Clear relations to avoid updating them
	l.AssignedUser = nil
	l.Account = nil
	l.Contact = nil
	l.Opportunity = nil

	return r.db.Model(l).Omit("AssignedUser", "Account", "Contact", "Opportunity").Updates(l).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&lead.Lead{}).Error
}

func (r *repository) GetAnalytics(req *lead.LeadAnalyticsRequest) (*lead.LeadAnalyticsResponse, error) {
	query := r.db.Model(&lead.Lead{})

	// Apply date filters
	if req.StartDate != "" {
		startDate, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			query = query.Where("created_at >= ?", startDate)
		}
	}
	if req.EndDate != "" {
		endDate, err := time.Parse("2006-01-02", req.EndDate)
		if err == nil {
			// Set to end of day
			endDate = endDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
			query = query.Where("created_at <= ?", endDate)
		}
	}

	if req.AssignedTo != "" {
		query = query.Where("assigned_to = ?", req.AssignedTo)
	}

	// Get total leads
	var totalLeads int64
	if err := query.Count(&totalLeads).Error; err != nil {
		return nil, err
	}

	// Get leads by status
	var statusCounts []struct {
		Status string
		Count  int64
	}
	if err := query.
		Select("lead_status as status, COUNT(*) as count").
		Group("lead_status").
		Scan(&statusCounts).Error; err != nil {
		return nil, err
	}

	leadsByStatus := make([]lead.StatusCount, 0, len(statusCounts))
	for _, sc := range statusCounts {
		percentage := float64(0)
		if totalLeads > 0 {
			percentage = float64(sc.Count) / float64(totalLeads) * 100
		}
		leadsByStatus = append(leadsByStatus, lead.StatusCount{
			Status:    sc.Status,
			Count:     sc.Count,
			Percentage: percentage,
		})
	}

	// Get leads by source
	var sourceCounts []struct {
		Source string
		Count  int64
	}
	if err := query.
		Select("lead_source as source, COUNT(*) as count").
		Group("lead_source").
		Scan(&sourceCounts).Error; err != nil {
		return nil, err
	}

	leadsBySource := make([]lead.SourceCount, 0, len(sourceCounts))
	for _, sc := range sourceCounts {
		percentage := float64(0)
		if totalLeads > 0 {
			percentage = float64(sc.Count) / float64(totalLeads) * 100
		}

		// Calculate conversion rate for this source
		var convertedCount int64
		r.db.Model(&lead.Lead{}).
			Where("lead_source = ? AND lead_status = ?", sc.Source, "converted").
			Count(&convertedCount)

		conversionRate := float64(0)
		if sc.Count > 0 {
			conversionRate = float64(convertedCount) / float64(sc.Count) * 100
		}

		leadsBySource = append(leadsBySource, lead.SourceCount{
			Source:         sc.Source,
			Count:          sc.Count,
			Percentage:     percentage,
			ConversionRate: conversionRate,
		})
	}

	// Get qualified and converted counts
	var qualifiedCount, convertedCount int64
	query.Where("lead_status = ?", "qualified").Count(&qualifiedCount)
	query.Where("lead_status = ?", "converted").Count(&convertedCount)

	// Calculate overall conversion rate
	conversionRate := float64(0)
	if totalLeads > 0 {
		conversionRate = float64(convertedCount) / float64(totalLeads) * 100
	}

	// Calculate average time to conversion
	var avgTimeToConversion *float64
	var avgDays float64
	err := query.
		Where("lead_status = ? AND converted_at IS NOT NULL", "converted").
		Select("AVG(EXTRACT(EPOCH FROM (converted_at - created_at)) / 86400)").
		Scan(&avgDays).Error
	if err == nil && avgDays > 0 {
		avgTimeToConversion = &avgDays
	}

	analytics := &lead.LeadAnalyticsResponse{
		TotalLeads:              totalLeads,
		LeadsByStatus:           leadsByStatus,
		LeadsBySource:          leadsBySource,
		ConversionRate:          conversionRate,
		AverageTimeToConversion: avgTimeToConversion,
		QualifiedLeadsCount:     qualifiedCount,
		ConvertedLeadsCount:      convertedCount,
	}

	return analytics, nil
}







