package contact

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Contact represents a contact entity (Doctor, PIC, Manager)
type Contact struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	AccountID string    `gorm:"type:uuid;not null;index" json:"account_id"`
	Name      string    `gorm:"type:varchar(255);not null" json:"name"`
	Role      string    `gorm:"type:varchar(50);not null" json:"role"` // doctor, pic, manager, other
	Phone     string    `gorm:"type:varchar(20)" json:"phone"`
	Email     string    `gorm:"type:varchar(255)" json:"email"`
	Position  string    `gorm:"type:varchar(255)" json:"position"`
	Notes     string    `gorm:"type:text" json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Contact
func (Contact) TableName() string {
	return "contacts"
}

// BeforeCreate hook to generate UUID
func (c *Contact) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

// ContactResponse represents contact response DTO
type ContactResponse struct {
	ID        string    `json:"id"`
	AccountID string    `json:"account_id"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	Position  string    `json:"position"`
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ToContactResponse converts Contact to ContactResponse
func (c *Contact) ToContactResponse() *ContactResponse {
	return &ContactResponse{
		ID:        c.ID,
		AccountID: c.AccountID,
		Name:      c.Name,
		Role:      c.Role,
		Phone:     c.Phone,
		Email:     c.Email,
		Position:  c.Position,
		Notes:     c.Notes,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}

// CreateContactRequest represents create contact request DTO
type CreateContactRequest struct {
	AccountID string `json:"account_id" binding:"required,uuid"`
	Name      string `json:"name" binding:"required,min=3"`
	Role      string `json:"role" binding:"required,oneof=doctor pic manager other"`
	Phone     string `json:"phone" binding:"omitempty"`
	Email     string `json:"email" binding:"omitempty,email"`
	Position  string `json:"position" binding:"omitempty"`
	Notes     string `json:"notes" binding:"omitempty"`
}

// UpdateContactRequest represents update contact request DTO
type UpdateContactRequest struct {
	AccountID string `json:"account_id" binding:"omitempty,uuid"`
	Name      string `json:"name" binding:"omitempty,min=3"`
	Role      string `json:"role" binding:"omitempty,oneof=doctor pic manager other"`
	Phone     string `json:"phone" binding:"omitempty"`
	Email     string `json:"email" binding:"omitempty,email"`
	Position  string `json:"position" binding:"omitempty"`
	Notes     string `json:"notes" binding:"omitempty"`
}

// ListContactsRequest represents list contacts query parameters
type ListContactsRequest struct {
	Page      int    `form:"page" binding:"omitempty,min=1"`
	PerPage   int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search    string `form:"search" binding:"omitempty"`
	AccountID string `form:"account_id" binding:"omitempty,uuid"`
	Role      string `form:"role" binding:"omitempty,oneof=doctor pic manager other"`
}

