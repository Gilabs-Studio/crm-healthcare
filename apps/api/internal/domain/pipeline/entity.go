package pipeline

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PipelineStage represents a pipeline stage (e.g., Lead, Qualification, Proposal, Negotiation, Closed Won, Closed Lost)
type PipelineStage struct {
	ID          string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Code        string         `gorm:"type:varchar(50);not null;uniqueIndex" json:"code"`
	Order       int            `gorm:"type:integer;not null;default:0" json:"order"`
	Color       string         `gorm:"type:varchar(20);default:'#3B82F6'" json:"color"`
	IsActive    bool           `gorm:"type:boolean;default:true" json:"is_active"`
	IsWon       bool           `gorm:"type:boolean;default:false" json:"is_won"`  // True for "Closed Won"
	IsLost      bool           `gorm:"type:boolean;default:false" json:"is_lost"` // True for "Closed Lost"
	Description string         `gorm:"type:text" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for PipelineStage
func (PipelineStage) TableName() string {
	return "pipeline_stages"
}

// BeforeCreate hook to generate UUID
func (ps *PipelineStage) BeforeCreate(tx *gorm.DB) error {
	if ps.ID == "" {
		ps.ID = uuid.New().String()
	}
	return nil
}

// PipelineStageResponse represents pipeline stage response DTO
type PipelineStageResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	Order       int       `json:"order"`
	Color       string    `json:"color"`
	IsActive    bool      `json:"is_active"`
	IsWon       bool      `json:"is_won"`
	IsLost      bool      `json:"is_lost"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToPipelineStageResponse converts PipelineStage to PipelineStageResponse
func (ps *PipelineStage) ToPipelineStageResponse() *PipelineStageResponse {
	return &PipelineStageResponse{
		ID:          ps.ID,
		Name:        ps.Name,
		Code:        ps.Code,
		Order:       ps.Order,
		Color:       ps.Color,
		IsActive:    ps.IsActive,
		IsWon:       ps.IsWon,
		IsLost:      ps.IsLost,
		Description: ps.Description,
		CreatedAt:   ps.CreatedAt,
		UpdatedAt:   ps.UpdatedAt,
	}
}

// Deal represents a sales deal/opportunity
type Deal struct {
	ID                string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title             string         `gorm:"type:varchar(255);not null" json:"title"`
	Description       string         `gorm:"type:text" json:"description"`
	AccountID         string         `gorm:"type:uuid;not null;index" json:"account_id"`
	Account           *AccountRef    `gorm:"foreignKey:AccountID" json:"account,omitempty"`
	ContactID         string         `gorm:"type:uuid;index" json:"contact_id"` // Optional contact
	Contact           *ContactRef    `gorm:"foreignKey:ContactID" json:"contact,omitempty"`
	StageID           string         `gorm:"type:uuid;not null;index" json:"stage_id"`
	Stage             *PipelineStage `gorm:"foreignKey:StageID" json:"stage,omitempty"`
	Value             int64          `gorm:"type:bigint;not null;default:0" json:"value"` // Deal value in smallest currency unit (sen)
	Probability       int            `gorm:"type:integer;default:0" json:"probability"`   // 0-100 percentage
	ExpectedCloseDate *time.Time     `gorm:"type:date" json:"expected_close_date"`
	ActualCloseDate   *time.Time     `gorm:"type:date" json:"actual_close_date"`
	AssignedTo        string         `gorm:"type:uuid;index" json:"assigned_to"` // Sales rep ID
	AssignedUser      *UserRef       `gorm:"foreignKey:AssignedTo" json:"assigned_user,omitempty"`
	Status            string         `gorm:"type:varchar(20);not null;default:'open'" json:"status"` // open, won, lost
	Source            string         `gorm:"type:varchar(100)" json:"source"`                        // e.g., "website", "referral", "cold_call"
	Notes             string         `gorm:"type:text" json:"notes"`
	CreatedBy         string         `gorm:"type:uuid;index" json:"created_by"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Deal
func (Deal) TableName() string {
	return "deals"
}

// BeforeCreate hook to generate UUID
func (d *Deal) BeforeCreate(tx *gorm.DB) error {
	if d.ID == "" {
		d.ID = uuid.New().String()
	}
	return nil
}

// AccountRef represents account reference in deal
type AccountRef struct {
	ID   string `gorm:"type:uuid;primary_key" json:"id"`
	Name string `json:"name"`
}

// TableName specifies the table name for AccountRef
func (AccountRef) TableName() string {
	return "accounts"
}

// ContactRef represents contact reference in deal
type ContactRef struct {
	ID    string `gorm:"type:uuid;primary_key" json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

// TableName specifies the table name for ContactRef
func (ContactRef) TableName() string {
	return "contacts"
}

// UserRef represents user reference in deal
type UserRef struct {
	ID    string `gorm:"type:uuid;primary_key" json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// TableName specifies the table name for UserRef
func (UserRef) TableName() string {
	return "users"
}

// DealResponse represents deal response DTO
type DealResponse struct {
	ID                string                 `json:"id"`
	Title             string                 `json:"title"`
	Description       string                 `json:"description"`
	AccountID         string                 `json:"account_id"`
	Account           *AccountRefResponse    `json:"account,omitempty"`
	ContactID         string                 `json:"contact_id"`
	Contact           *ContactRefResponse    `json:"contact,omitempty"`
	StageID           string                 `json:"stage_id"`
	Stage             *PipelineStageResponse `json:"stage,omitempty"`
	Value             int64                  `json:"value"`
	ValueFormatted    string                 `json:"value_formatted,omitempty"`
	Probability       int                    `json:"probability"`
	ExpectedCloseDate *time.Time             `json:"expected_close_date"`
	ActualCloseDate   *time.Time             `json:"actual_close_date"`
	AssignedTo        string                 `json:"assigned_to"`
	AssignedUser      *UserRefResponse       `json:"assigned_user,omitempty"`
	Status            string                 `json:"status"`
	Source            string                 `json:"source"`
	Notes             string                 `json:"notes"`
	CreatedBy         string                 `json:"created_by"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
}

// AccountRefResponse represents account in deal response
type AccountRefResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// ContactRefResponse represents contact in deal response
type ContactRefResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

// UserRefResponse represents user in deal response
type UserRefResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// ToDealResponse converts Deal to DealResponse
func (d *Deal) ToDealResponse() *DealResponse {
	resp := &DealResponse{
		ID:                d.ID,
		Title:             d.Title,
		Description:       d.Description,
		AccountID:         d.AccountID,
		ContactID:         d.ContactID,
		StageID:           d.StageID,
		Value:             d.Value,
		Probability:       d.Probability,
		ExpectedCloseDate: d.ExpectedCloseDate,
		ActualCloseDate:   d.ActualCloseDate,
		AssignedTo:        d.AssignedTo,
		Status:            d.Status,
		Source:            d.Source,
		Notes:             d.Notes,
		CreatedBy:         d.CreatedBy,
		CreatedAt:         d.CreatedAt,
		UpdatedAt:         d.UpdatedAt,
	}

	// Format value as currency (including 0, as 0 is a valid value)
	resp.ValueFormatted = formatCurrency(d.Value)

	if d.Account != nil {
		resp.Account = &AccountRefResponse{
			ID:   d.Account.ID,
			Name: d.Account.Name,
		}
	}

	if d.Contact != nil {
		resp.Contact = &ContactRefResponse{
			ID:    d.Contact.ID,
			Name:  d.Contact.Name,
			Email: d.Contact.Email,
			Phone: d.Contact.Phone,
		}
	}

	if d.Stage != nil {
		resp.Stage = d.Stage.ToPipelineStageResponse()
	}

	if d.AssignedUser != nil {
		resp.AssignedUser = &UserRefResponse{
			ID:    d.AssignedUser.ID,
			Name:  d.AssignedUser.Name,
			Email: d.AssignedUser.Email,
		}
	}

	return resp
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
	// We'll build the result by inserting dots every 3 digits from right
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

// CreateDealRequest represents create deal request DTO
type CreateDealRequest struct {
	Title             string     `json:"title" binding:"required,min=3,max=255"`
	Description       string     `json:"description" binding:"omitempty"`
	AccountID         string     `json:"account_id" binding:"required,uuid"`
	ContactID         string     `json:"contact_id" binding:"omitempty,uuid"`
	StageID           string     `json:"stage_id" binding:"required,uuid"`
	Value             int64      `json:"value" binding:"required,min=0"`
	Probability       int        `json:"probability" binding:"omitempty,min=0,max=100"`
	ExpectedCloseDate *time.Time `json:"expected_close_date" binding:"omitempty"`
	AssignedTo        string     `json:"assigned_to" binding:"omitempty,uuid"`
	Source            string     `json:"source" binding:"omitempty,max=100"`
	Notes             string     `json:"notes" binding:"omitempty"`
}

// UpdateDealRequest represents update deal request DTO
type UpdateDealRequest struct {
	Title             string     `json:"title" binding:"omitempty,min=3,max=255"`
	Description       string     `json:"description" binding:"omitempty"`
	AccountID         string     `json:"account_id" binding:"omitempty,uuid"`
	ContactID         string     `json:"contact_id" binding:"omitempty,uuid"`
	StageID           string     `json:"stage_id" binding:"omitempty,uuid"`
	Value             *int64     `json:"value" binding:"omitempty,min=0"`
	Probability       *int       `json:"probability" binding:"omitempty,min=0,max=100"`
	ExpectedCloseDate *time.Time `json:"expected_close_date" binding:"omitempty"`
	AssignedTo        string     `json:"assigned_to" binding:"omitempty,uuid"`
	Status            string     `json:"status" binding:"omitempty,oneof=open won lost"`
	Source            string     `json:"source" binding:"omitempty,max=100"`
	Notes             string     `json:"notes" binding:"omitempty"`
}

// MoveDealRequest represents move deal request DTO
type MoveDealRequest struct {
	StageID string `json:"stage_id" binding:"required,uuid"`
}

// ListDealsRequest represents list deals query parameters
type ListDealsRequest struct {
	Page       int    `form:"page" binding:"omitempty,min=1"`
	PerPage    int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search     string `form:"search" binding:"omitempty"`
	StageID    string `form:"stage_id" binding:"omitempty,uuid"`
	AccountID  string `form:"account_id" binding:"omitempty,uuid"`
	AssignedTo string `form:"assigned_to" binding:"omitempty,uuid"`
	Status     string `form:"status" binding:"omitempty,oneof=open won lost"`
	Source     string `form:"source" binding:"omitempty"`
}

// ListPipelineStagesRequest represents list pipeline stages query parameters
type ListPipelineStagesRequest struct {
	IsActive *bool `form:"is_active" binding:"omitempty"`
}

// CreateStageRequest represents create pipeline stage request DTO
type CreateStageRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=255"`
	Code        string `json:"code" binding:"required,min=1,max=50"`
	Order       int    `json:"order" binding:"required,min=0"`
	Color       string `json:"color" binding:"omitempty,max=20"`
	IsActive    bool   `json:"is_active" binding:"omitempty"`
	IsWon       bool   `json:"is_won" binding:"omitempty"`
	IsLost      bool   `json:"is_lost" binding:"omitempty"`
	Description string `json:"description" binding:"omitempty"`
}

// UpdateStageRequest represents update pipeline stage request DTO
type UpdateStageRequest struct {
	Name        string `json:"name" binding:"omitempty,min=1,max=255"`
	Code        string `json:"code" binding:"omitempty,min=1,max=50"`
	Order       *int   `json:"order" binding:"omitempty,min=0"`
	Color       string `json:"color" binding:"omitempty,max=20"`
	IsActive    *bool  `json:"is_active" binding:"omitempty"`
	IsWon       *bool  `json:"is_won" binding:"omitempty"`
	IsLost      *bool  `json:"is_lost" binding:"omitempty"`
	Description string `json:"description" binding:"omitempty"`
}

// UpdateStagesOrderRequest represents update stages order request DTO
type UpdateStagesOrderRequest struct {
	Stages []StageOrderItem `json:"stages" binding:"required,min=1,dive"`
}

// StageOrderItem represents a stage order item
type StageOrderItem struct {
	ID    string `json:"id" binding:"required,uuid"`
	Order int    `json:"order" binding:"required,min=0"`
}

// PipelineSummaryResponse represents pipeline summary response
type PipelineSummaryResponse struct {
	TotalDeals          int64          `json:"total_deals"`
	TotalValue          int64          `json:"total_value"`
	TotalValueFormatted string         `json:"total_value_formatted"`
	WonDeals            int64          `json:"won_deals"`
	WonValue            int64          `json:"won_value"`
	WonValueFormatted   string         `json:"won_value_formatted"`
	LostDeals           int64          `json:"lost_deals"`
	LostValue           int64          `json:"lost_value"`
	LostValueFormatted  string         `json:"lost_value_formatted"`
	OpenDeals           int64          `json:"open_deals"`
	OpenValue           int64          `json:"open_value"`
	OpenValueFormatted  string         `json:"open_value_formatted"`
	ByStage             []StageSummary `json:"by_stage"`
}

// StageSummary represents summary for a stage
type StageSummary struct {
	StageID             string `json:"stage_id"`
	StageName           string `json:"stage_name"`
	StageCode           string `json:"stage_code"`
	DealCount           int64  `json:"deal_count"`
	TotalValue          int64  `json:"total_value"`
	TotalValueFormatted string `json:"total_value_formatted"`
}

// ForecastResponse represents forecast response
type ForecastResponse struct {
	Period                   ForecastPeriod `json:"period"`
	ExpectedRevenue          int64          `json:"expected_revenue"`
	ExpectedRevenueFormatted string         `json:"expected_revenue_formatted"`
	WeightedRevenue          int64          `json:"weighted_revenue"`
	WeightedRevenueFormatted string         `json:"weighted_revenue_formatted"`
	Deals                    []ForecastDeal `json:"deals"`
}

// ForecastPeriod represents forecast period
type ForecastPeriod struct {
	Type  string    `json:"type"` // "month", "quarter", "year"
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

// ForecastDeal represents a deal in forecast
type ForecastDeal struct {
	ID                     string     `json:"id"`
	Title                  string     `json:"title"`
	AccountID              string     `json:"account_id"`              // ID for creating modal links
	AccountName            string     `json:"account_name"`
	ContactID              string     `json:"contact_id,omitempty"`    // ID for creating modal links (optional)
	ContactName            string     `json:"contact_name,omitempty"`   // Name for display (optional)
	StageName              string     `json:"stage_name"`
	Value                  int64      `json:"value"`
	ValueFormatted         string     `json:"value_formatted"`
	Probability            int        `json:"probability"`
	WeightedValue          int64      `json:"weighted_value"`
	WeightedValueFormatted string     `json:"weighted_value_formatted"`
	ExpectedCloseDate      *time.Time `json:"expected_close_date"`
}
