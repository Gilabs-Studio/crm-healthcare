package task

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Task represents a task in the CRM system
type Task struct {
	ID          string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title       string         `gorm:"type:varchar(255);not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Type        string         `gorm:"type:varchar(50);not null;default:'general'" json:"type"` // general, call, email, meeting, follow_up
	Status      string         `gorm:"type:varchar(20);not null;default:'pending'" json:"status"` // pending, in_progress, completed, cancelled
	Priority    string         `gorm:"type:varchar(20);default:'medium'" json:"priority"`        // low, medium, high, urgent
	DueDate     *time.Time     `gorm:"type:timestamp" json:"due_date"`
	CompletedAt *time.Time     `gorm:"type:timestamp" json:"completed_at"`
	AssignedTo  string         `gorm:"type:uuid;index" json:"assigned_to"` // User ID
	AssignedUser *UserRef      `gorm:"foreignKey:AssignedTo" json:"assigned_user,omitempty"`
	AccountID   string         `gorm:"type:uuid;index" json:"account_id"` // Optional: link to account
	Account     *AccountRef   `gorm:"foreignKey:AccountID" json:"account,omitempty"`
	ContactID   string         `gorm:"type:uuid;index" json:"contact_id"` // Optional: link to contact
	Contact     *ContactRef   `gorm:"foreignKey:ContactID" json:"contact,omitempty"`
	DealID      string         `gorm:"type:uuid;index" json:"deal_id"` // Optional: link to deal
	Deal        *DealRef       `gorm:"foreignKey:DealID" json:"deal,omitempty"`
	CreatedBy   string         `gorm:"type:uuid;index" json:"created_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Task
func (Task) TableName() string {
	return "tasks"
}

// BeforeCreate hook to generate UUID
func (t *Task) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

// UserRef represents user reference in task
type UserRef struct {
	ID    string `gorm:"type:uuid;primary_key" json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// TableName specifies the table name for UserRef
func (UserRef) TableName() string {
	return "users"
}

// AccountRef represents account reference in task
type AccountRef struct {
	ID   string `gorm:"type:uuid;primary_key" json:"id"`
	Name string `json:"name"`
}

// TableName specifies the table name for AccountRef
func (AccountRef) TableName() string {
	return "accounts"
}

// ContactRef represents contact reference in task
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

// DealRef represents deal reference in task
type DealRef struct {
	ID    string `gorm:"type:uuid;primary_key" json:"id"`
	Title string `json:"title"`
}

// TableName specifies the table name for DealRef
func (DealRef) TableName() string {
	return "deals"
}

// TaskResponse represents task response DTO
type TaskResponse struct {
	ID          string            `json:"id"`
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Type        string            `json:"type"`
	Status      string            `json:"status"`
	Priority    string            `json:"priority"`
	DueDate     *time.Time        `json:"due_date"`
	CompletedAt *time.Time        `json:"completed_at"`
	AssignedTo  string            `json:"assigned_to"`
	AssignedUser *UserRefResponse `json:"assigned_user,omitempty"`
	AccountID   string            `json:"account_id"`
	Account     *AccountRefResponse `json:"account,omitempty"`
	ContactID   string            `json:"contact_id"`
	Contact     *ContactRefResponse `json:"contact,omitempty"`
	DealID      string            `json:"deal_id"`
	Deal        *DealRefResponse  `json:"deal,omitempty"`
	CreatedBy   string            `json:"created_by"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

// UserRefResponse represents user in task response
type UserRefResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// AccountRefResponse represents account in task response
type AccountRefResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// ContactRefResponse represents contact in task response
type ContactRefResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

// DealRefResponse represents deal in task response
type DealRefResponse struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

// ToTaskResponse converts Task to TaskResponse
func (t *Task) ToTaskResponse() *TaskResponse {
	resp := &TaskResponse{
		ID:          t.ID,
		Title:       t.Title,
		Description: t.Description,
		Type:        t.Type,
		Status:      t.Status,
		Priority:    t.Priority,
		DueDate:     t.DueDate,
		CompletedAt: t.CompletedAt,
		AssignedTo:  t.AssignedTo,
		AccountID:   t.AccountID,
		ContactID:   t.ContactID,
		DealID:      t.DealID,
		CreatedBy:   t.CreatedBy,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}

	if t.AssignedUser != nil {
		resp.AssignedUser = &UserRefResponse{
			ID:    t.AssignedUser.ID,
			Name:  t.AssignedUser.Name,
			Email: t.AssignedUser.Email,
		}
	}

	if t.Account != nil {
		resp.Account = &AccountRefResponse{
			ID:   t.Account.ID,
			Name: t.Account.Name,
		}
	}

	if t.Contact != nil {
		resp.Contact = &ContactRefResponse{
			ID:    t.Contact.ID,
			Name:  t.Contact.Name,
			Email: t.Contact.Email,
			Phone: t.Contact.Phone,
		}
	}

	if t.Deal != nil {
		resp.Deal = &DealRefResponse{
			ID:    t.Deal.ID,
			Title: t.Deal.Title,
		}
	}

	return resp
}

// CreateTaskRequest represents create task request DTO
type CreateTaskRequest struct {
	Title       string     `json:"title" binding:"required,min=3,max=255"`
	Description string     `json:"description" binding:"omitempty"`
	Type        string     `json:"type" binding:"omitempty,oneof=general call email meeting follow_up"`
	Priority    string     `json:"priority" binding:"omitempty,oneof=low medium high urgent"`
	DueDate     *time.Time `json:"due_date" binding:"omitempty"`
	AssignedTo  string     `json:"assigned_to" binding:"omitempty,uuid"`
	AccountID   string     `json:"account_id" binding:"omitempty,uuid"`
	ContactID   string     `json:"contact_id" binding:"omitempty,uuid"`
	DealID      string     `json:"deal_id" binding:"omitempty,uuid"`
}

// UpdateTaskRequest represents update task request DTO
type UpdateTaskRequest struct {
	Title       string     `json:"title" binding:"omitempty,min=3,max=255"`
	Description string     `json:"description" binding:"omitempty"`
	Type        string     `json:"type" binding:"omitempty,oneof=general call email meeting follow_up"`
	Status      string     `json:"status" binding:"omitempty,oneof=pending in_progress completed cancelled"`
	Priority    string     `json:"priority" binding:"omitempty,oneof=low medium high urgent"`
	DueDate     *time.Time `json:"due_date" binding:"omitempty"`
	AssignedTo  string     `json:"assigned_to" binding:"omitempty,uuid"`
	AccountID   string     `json:"account_id" binding:"omitempty,uuid"`
	ContactID   string     `json:"contact_id" binding:"omitempty,uuid"`
	DealID      string     `json:"deal_id" binding:"omitempty,uuid"`
}

// AssignTaskRequest represents assign task request DTO
type AssignTaskRequest struct {
	AssignedTo string `json:"assigned_to" binding:"required,uuid"`
}

// ListTasksRequest represents list tasks query parameters
type ListTasksRequest struct {
	Page       int    `form:"page" binding:"omitempty,min=1"`
	PerPage    int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search     string `form:"search" binding:"omitempty"`
	Status     string `form:"status" binding:"omitempty,oneof=pending in_progress completed cancelled"`
	Priority   string `form:"priority" binding:"omitempty,oneof=low medium high urgent"`
	Type       string `form:"type" binding:"omitempty,oneof=general call email meeting follow_up"`
	AssignedTo string `form:"assigned_to" binding:"omitempty,uuid"`
	AccountID  string `form:"account_id" binding:"omitempty,uuid"`
	ContactID  string `form:"contact_id" binding:"omitempty,uuid"`
	DealID     string `form:"deal_id" binding:"omitempty,uuid"`
	DueDateFrom *time.Time `form:"due_date_from" binding:"omitempty"`
	DueDateTo   *time.Time `form:"due_date_to" binding:"omitempty"`
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



