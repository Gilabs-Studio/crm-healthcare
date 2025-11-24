package account

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Account represents an account entity (Hospital, Clinic, Pharmacy)
type Account struct {
	ID         string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name       string    `gorm:"type:varchar(255);not null" json:"name"`
	Category   string    `gorm:"type:varchar(50);not null" json:"category"` // hospital, clinic, pharmacy
	Address    string    `gorm:"type:text" json:"address"`
	City       string    `gorm:"type:varchar(100)" json:"city"`
	Province   string    `gorm:"type:varchar(100)" json:"province"`
	Phone      string    `gorm:"type:varchar(20)" json:"phone"`
	Email      string    `gorm:"type:varchar(255)" json:"email"`
	Status     string    `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	AssignedTo string    `gorm:"type:uuid;index" json:"assigned_to"` // Sales rep ID
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Account
func (Account) TableName() string {
	return "accounts"
}

// BeforeCreate hook to generate UUID
func (a *Account) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
}

// AccountResponse represents account response DTO
type AccountResponse struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Category   string    `json:"category"`
	Address    string    `json:"address"`
	City       string    `json:"city"`
	Province   string    `json:"province"`
	Phone      string    `json:"phone"`
	Email      string    `json:"email"`
	Status     string    `json:"status"`
	AssignedTo string    `json:"assigned_to"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// ToAccountResponse converts Account to AccountResponse
func (a *Account) ToAccountResponse() *AccountResponse {
	return &AccountResponse{
		ID:         a.ID,
		Name:       a.Name,
		Category:   a.Category,
		Address:    a.Address,
		City:       a.City,
		Province:   a.Province,
		Phone:      a.Phone,
		Email:      a.Email,
		Status:     a.Status,
		AssignedTo: a.AssignedTo,
		CreatedAt:  a.CreatedAt,
		UpdatedAt:  a.UpdatedAt,
	}
}

// CreateAccountRequest represents create account request DTO
type CreateAccountRequest struct {
	Name       string `json:"name" binding:"required,min=3"`
	Category   string `json:"category" binding:"required,oneof=hospital clinic pharmacy"`
	Address    string `json:"address" binding:"omitempty"`
	City       string `json:"city" binding:"omitempty"`
	Province   string `json:"province" binding:"omitempty"`
	Phone      string `json:"phone" binding:"omitempty"`
	Email      string `json:"email" binding:"omitempty,email"`
	Status     string `json:"status" binding:"omitempty,oneof=active inactive"`
	AssignedTo string `json:"assigned_to" binding:"omitempty,uuid"`
}

// UpdateAccountRequest represents update account request DTO
type UpdateAccountRequest struct {
	Name       string `json:"name" binding:"omitempty,min=3"`
	Category   string `json:"category" binding:"omitempty,oneof=hospital clinic pharmacy"`
	Address    string `json:"address" binding:"omitempty"`
	City       string `json:"city" binding:"omitempty"`
	Province   string `json:"province" binding:"omitempty"`
	Phone      string `json:"phone" binding:"omitempty"`
	Email      string `json:"email" binding:"omitempty,email"`
	Status     string `json:"status" binding:"omitempty,oneof=active inactive"`
	AssignedTo string `json:"assigned_to" binding:"omitempty,uuid"`
}

// ListAccountsRequest represents list accounts query parameters
type ListAccountsRequest struct {
	Page      int    `form:"page" binding:"omitempty,min=1"`
	PerPage   int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search    string `form:"search" binding:"omitempty"`
	Status    string `form:"status" binding:"omitempty,oneof=active inactive"`
	Category  string `form:"category" binding:"omitempty,oneof=hospital clinic pharmacy"`
	AssignedTo string `form:"assigned_to" binding:"omitempty,uuid"`
}

