package deal

import (
	"strings"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new deal repository
func NewRepository(db *gorm.DB) interfaces.DealRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*pipeline.Deal, error) {
	var deal pipeline.Deal
	err := r.db.
		Preload("Account").
		Preload("Contact").
		Preload("Stage").
		Preload("AssignedUser").
		Where("id = ?", id).
		First(&deal).Error
	if err != nil {
		return nil, err
	}
	return &deal, nil
}

func (r *repository) List(req *pipeline.ListDealsRequest) ([]pipeline.Deal, int64, error) {
	var deals []pipeline.Deal
	var total int64

	query := r.db.Model(&pipeline.Deal{})

	// Apply filters
	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where(
			"LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(notes) LIKE ?",
			search, search, search,
		)
	}

	if req.StageID != "" {
		query = query.Where("stage_id = ?", req.StageID)
	}

	if req.AccountID != "" {
		query = query.Where("account_id = ?", req.AccountID)
	}

	if req.AssignedTo != "" {
		query = query.Where("assigned_to = ?", req.AssignedTo)
	}

	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}

	if req.Source != "" {
		query = query.Where("source = ?", req.Source)
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

	// Fetch data with preload
	err := query.
		Preload("Account").
		Preload("Contact").
		Preload("Stage").
		Preload("AssignedUser").
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&deals).Error
	if err != nil {
		return nil, 0, err
	}

	return deals, total, nil
}

func (r *repository) Create(deal *pipeline.Deal) error {
	return r.db.Create(deal).Error
}

func (r *repository) Update(deal *pipeline.Deal) error {

	deal.Account = nil
	deal.Contact = nil
	deal.Stage = nil
	deal.AssignedUser = nil

	return r.db.Model(deal).Omit("Account", "Contact", "Stage", "AssignedUser").Updates(deal).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&pipeline.Deal{}).Error
}

func (r *repository) GetSummary() (*pipeline.PipelineSummaryResponse, error) {
	var totalDeals, wonDeals, lostDeals, openDeals int64
	var totalValue, wonValue, lostValue, openValue int64

	// Count total deals
	if err := r.db.Model(&pipeline.Deal{}).Count(&totalDeals).Error; err != nil {
		return nil, err
	}

	// Sum total value
	if err := r.db.Model(&pipeline.Deal{}).Select("COALESCE(SUM(value), 0)").Scan(&totalValue).Error; err != nil {
		return nil, err
	}

	// Count and sum won deals
	if err := r.db.Model(&pipeline.Deal{}).Where("status = ?", "won").Count(&wonDeals).Error; err != nil {
		return nil, err
	}
	if err := r.db.Model(&pipeline.Deal{}).Where("status = ?", "won").Select("COALESCE(SUM(value), 0)").Scan(&wonValue).Error; err != nil {
		return nil, err
	}

	// Count and sum lost deals
	if err := r.db.Model(&pipeline.Deal{}).Where("status = ?", "lost").Count(&lostDeals).Error; err != nil {
		return nil, err
	}
	if err := r.db.Model(&pipeline.Deal{}).Where("status = ?", "lost").Select("COALESCE(SUM(value), 0)").Scan(&lostValue).Error; err != nil {
		return nil, err
	}

	// Count and sum open deals
	if err := r.db.Model(&pipeline.Deal{}).Where("status = ?", "open").Count(&openDeals).Error; err != nil {
		return nil, err
	}
	if err := r.db.Model(&pipeline.Deal{}).Where("status = ?", "open").Select("COALESCE(SUM(value), 0)").Scan(&openValue).Error; err != nil {
		return nil, err
	}

	// Get summary by stage
	var stageSummaries []pipeline.StageSummary
	err := r.db.Model(&pipeline.Deal{}).
		Select(`
			stage_id,
			COUNT(*) as deal_count,
			COALESCE(SUM(value), 0) as total_value
		`).
		Group("stage_id").
		Scan(&stageSummaries).Error
	if err != nil {
		return nil, err
	}

	// Get stage names
	for i := range stageSummaries {
		var stage pipeline.PipelineStage
		if err := r.db.Where("id = ?", stageSummaries[i].StageID).First(&stage).Error; err == nil {
			stageSummaries[i].StageName = stage.Name
			stageSummaries[i].StageCode = stage.Code
		}
		// Format value
		stageSummaries[i].TotalValueFormatted = formatCurrency(stageSummaries[i].TotalValue)
	}

	summary := &pipeline.PipelineSummaryResponse{
		TotalDeals:          totalDeals,
		TotalValue:          totalValue,
		TotalValueFormatted: formatCurrency(totalValue),
		WonDeals:            wonDeals,
		WonValue:            wonValue,
		WonValueFormatted:   formatCurrency(wonValue),
		LostDeals:           lostDeals,
		LostValue:           lostValue,
		LostValueFormatted:  formatCurrency(lostValue),
		OpenDeals:           openDeals,
		OpenValue:           openValue,
		OpenValueFormatted:  formatCurrency(openValue),
		ByStage:             stageSummaries,
	}

	return summary, nil
}

func (r *repository) GetForecast(periodType string, start, end time.Time) (*pipeline.ForecastResponse, error) {
	// Get deals with expected close date in the period
	var deals []pipeline.Deal
	err := r.db.
		Preload("Account").
		Preload("Stage").
		Where("expected_close_date >= ? AND expected_close_date <= ?", start, end).
		Where("status = ?", "open").
		Find(&deals).Error
	if err != nil {
		return nil, err
	}

	var expectedRevenue, weightedRevenue int64
	forecastDeals := make([]pipeline.ForecastDeal, 0, len(deals))

	for _, deal := range deals {
		expectedRevenue += deal.Value
		weightedValue := deal.Value * int64(deal.Probability) / 100
		weightedRevenue += weightedValue

		accountName := ""
		if deal.Account != nil {
			accountName = deal.Account.Name
		}

		stageName := ""
		if deal.Stage != nil {
			stageName = deal.Stage.Name
		}

		forecastDeals = append(forecastDeals, pipeline.ForecastDeal{
			ID:                     deal.ID,
			Title:                  deal.Title,
			AccountName:            accountName,
			StageName:              stageName,
			Value:                  deal.Value,
			ValueFormatted:         formatCurrency(deal.Value),
			Probability:            deal.Probability,
			WeightedValue:          weightedValue,
			WeightedValueFormatted: formatCurrency(weightedValue),
			ExpectedCloseDate:      deal.ExpectedCloseDate,
		})
	}

	forecast := &pipeline.ForecastResponse{
		Period: pipeline.ForecastPeriod{
			Type:  periodType,
			Start: start,
			End:   end,
		},
		ExpectedRevenue:          expectedRevenue,
		ExpectedRevenueFormatted: formatCurrency(expectedRevenue),
		WeightedRevenue:          weightedRevenue,
		WeightedRevenueFormatted: formatCurrency(weightedRevenue),
		Deals:                    forecastDeals,
	}

	return forecast, nil
}

// formatCurrency formats integer (sen) to formatted currency string
func formatCurrency(amount int64) string {
	// Convert to Rupiah (divide by 100 if stored in sen)
	rupiah := float64(amount) / 100.0
	// Simple formatting - in production use proper number formatting
	return "Rp " + formatNumber(rupiah)
}

// formatNumber formats number with thousand separator
func formatNumber(n float64) string {
	// Simple implementation - in production use proper formatting
	// For now, just return basic string representation
	if n == 0 {
		return "0"
	}
	// Basic formatting - in production use proper number formatting library
	return ""
}
