package activity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Activity represents an activity entity
type Activity struct {
	ID          string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Type        string         `gorm:"type:varchar(50);not null;index" json:"type"` // visit, call, email, task, deal
	AccountID   *string        `gorm:"type:uuid;index" json:"account_id,omitempty"`
	ContactID   *string        `gorm:"type:uuid;index" json:"contact_id,omitempty"`
	UserID      string         `gorm:"type:uuid;not null;index" json:"user_id"`
	Description string         `gorm:"type:text;not null" json:"description"`
	Timestamp   time.Time      `gorm:"type:timestamp;not null;index" json:"timestamp"`
	Metadata    datatypes.JSON `gorm:"type:jsonb" json:"metadata,omitempty"` // Additional data as JSON
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations (for preloading)
	Account interface{} `gorm:"-" json:"account,omitempty"`
	Contact interface{} `gorm:"-" json:"contact,omitempty"`
	User    interface{} `gorm:"-" json:"user,omitempty"`
}

// TableName specifies the table name for Activity
func (Activity) TableName() string {
	return "activities"
}

// BeforeCreate hook to generate UUID
func (a *Activity) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
}

// ActivityResponse represents activity response DTO
type ActivityResponse struct {
	ID          string      `json:"id"`
	Type        string      `json:"type"`
	AccountID   *string     `json:"account_id,omitempty"`
	ContactID   *string     `json:"contact_id,omitempty"`
	UserID      string      `json:"user_id"`
	Description string      `json:"description"`
	Timestamp   time.Time   `json:"timestamp"`
	Metadata    interface{} `json:"metadata,omitempty"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	Account     interface{} `json:"account,omitempty"`
	Contact     interface{} `json:"contact,omitempty"`
	User        interface{} `json:"user,omitempty"`
}

// ToActivityResponse converts Activity to ActivityResponse
func (a *Activity) ToActivityResponse() *ActivityResponse {
	var metadata interface{}
	if a.Metadata != nil {
		// Parse JSON to interface{}
		// This will be handled in the service layer
	}

	resp := &ActivityResponse{
		ID:          a.ID,
		Type:        a.Type,
		AccountID:   a.AccountID,
		ContactID:   a.ContactID,
		UserID:      a.UserID,
		Description: a.Description,
		Timestamp:   a.Timestamp,
		Metadata:    metadata,
		CreatedAt:   a.CreatedAt,
		UpdatedAt:   a.UpdatedAt,
		Account:     a.Account,
		Contact:     a.Contact,
		User:        a.User,
	}
	return resp
}

// CreateActivityRequest represents create activity request DTO
type CreateActivityRequest struct {
	Type        string      `json:"type" binding:"required,oneof=visit call email task deal"`
	AccountID   *string     `json:"account_id" binding:"omitempty,uuid"`
	ContactID   *string     `json:"contact_id" binding:"omitempty,uuid"`
	UserID      string      `json:"user_id" binding:"required,uuid"`
	Description string      `json:"description" binding:"required,min=3"`
	Timestamp   string      `json:"timestamp" binding:"required"`
	Metadata    interface{} `json:"metadata" binding:"omitempty"`
}

// ListActivitiesRequest represents list activities query parameters
type ListActivitiesRequest struct {
	Page      int    `form:"page" binding:"omitempty,min=1"`
	PerPage   int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Type      string `form:"type" binding:"omitempty,oneof=visit call email task deal"`
	AccountID string `form:"account_id" binding:"omitempty,uuid"`
	ContactID string `form:"contact_id" binding:"omitempty,uuid"`
	UserID    string `form:"user_id" binding:"omitempty,uuid"`
	StartDate string `form:"start_date" binding:"omitempty"`
	EndDate   string `form:"end_date" binding:"omitempty"`
}

// ActivityTimelineRequest represents activity timeline query parameters
type ActivityTimelineRequest struct {
	AccountID string `form:"account_id" binding:"omitempty,uuid"`
	ContactID string `form:"contact_id" binding:"omitempty,uuid"`
	UserID    string `form:"user_id" binding:"omitempty,uuid"`
	StartDate string `form:"start_date" binding:"omitempty"`
	EndDate   string `form:"end_date" binding:"omitempty"`
	Limit     int    `form:"limit" binding:"omitempty,min=1,max=100"`
}

