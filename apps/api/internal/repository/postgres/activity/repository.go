package activity

import (
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new activity repository
func NewRepository(db *gorm.DB) interfaces.ActivityRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*activity.Activity, error) {
	var a activity.Activity
	err := r.db.Where("id = ?", id).First(&a).Error
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *repository) List(req *activity.ListActivitiesRequest) ([]activity.Activity, int64, error) {
	var activities []activity.Activity
	var total int64

	query := r.db.Model(&activity.Activity{})

	// Apply filters
	if req.Type != "" {
		query = query.Where("type = ?", req.Type)
	}

	if req.AccountID != "" {
		query = query.Where("account_id = ?", req.AccountID)
	}

	if req.ContactID != "" {
		query = query.Where("contact_id = ?", req.ContactID)
	}

	if req.UserID != "" {
		query = query.Where("user_id = ?", req.UserID)
	}

	// Date range filter
	if req.StartDate != "" {
		startDate, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			query = query.Where("timestamp >= ?", startDate)
		}
	}

	if req.EndDate != "" {
		endDate, err := time.Parse("2006-01-02", req.EndDate)
		if err == nil {
			// Add one day to include the end date
			endDate = endDate.Add(24 * time.Hour)
			query = query.Where("timestamp < ?", endDate)
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
	err := query.Order("timestamp DESC").Offset(offset).Limit(perPage).Find(&activities).Error
	if err != nil {
		return nil, 0, err
	}

	return activities, total, nil
}

func (r *repository) Create(a *activity.Activity) error {
	return r.db.Create(a).Error
}

func (r *repository) Update(a *activity.Activity) error {
	return r.db.Save(a).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&activity.Activity{}).Error
}

func (r *repository) GetTimeline(req *activity.ActivityTimelineRequest) ([]activity.Activity, error) {
	var activities []activity.Activity

	query := r.db.Model(&activity.Activity{})

	// Apply filters
	if req.AccountID != "" {
		query = query.Where("account_id = ?", req.AccountID)
	}

	if req.ContactID != "" {
		query = query.Where("contact_id = ?", req.ContactID)
	}

	if req.UserID != "" {
		query = query.Where("user_id = ?", req.UserID)
	}

	// Date range filter
	if req.StartDate != "" {
		startDate, err := time.Parse("2006-01-02", req.StartDate)
		if err == nil {
			query = query.Where("timestamp >= ?", startDate)
		}
	}

	if req.EndDate != "" {
		endDate, err := time.Parse("2006-01-02", req.EndDate)
		if err == nil {
			// Add one day to include the end date
			endDate = endDate.Add(24 * time.Hour)
			query = query.Where("timestamp < ?", endDate)
		}
	}

	// Limit
	limit := req.Limit
	if limit < 1 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}

	// Fetch data ordered by timestamp
	err := query.Order("timestamp DESC").Limit(limit).Find(&activities).Error
	if err != nil {
		return nil, err
	}

	return activities, nil
}

func (r *repository) FindByAccountID(accountID string) ([]activity.Activity, error) {
	var activities []activity.Activity
	err := r.db.Where("account_id = ?", accountID).Order("timestamp DESC").Find(&activities).Error
	if err != nil {
		return nil, err
	}
	return activities, nil
}

