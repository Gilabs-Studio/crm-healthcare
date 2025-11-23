package category

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CategoryType represents the type of category
type CategoryType string

const (
	CategoryTypeDiagnosis CategoryType = "diagnosis"
	CategoryTypeProcedure CategoryType = "procedure"
)

// Category represents a category entity
type Category struct {
	ID          string       `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Type        CategoryType `gorm:"type:varchar(20);not null;index" json:"type"` // diagnosis or procedure
	Name        string       `gorm:"type:varchar(255);not null" json:"name"`
	Description *string      `gorm:"type:text" json:"description,omitempty"`
	Status      string       `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Category
func (Category) TableName() string {
	return "categories"
}

// BeforeCreate hook to generate UUID
func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

// CategoryResponse represents category response DTO
type CategoryResponse struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToCategoryResponse converts Category to CategoryResponse
func (c *Category) ToCategoryResponse() *CategoryResponse {
	return &CategoryResponse{
		ID:          c.ID,
		Type:        string(c.Type),
		Name:        c.Name,
		Description: c.Description,
		Status:      c.Status,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}

// CreateCategoryRequest represents create category request DTO
type CreateCategoryRequest struct {
	Type        string  `json:"type" binding:"required,oneof=diagnosis procedure"`
	Name        string  `json:"name" binding:"required,min=1,max=255"`
	Description *string `json:"description,omitempty"`
	Status      string  `json:"status" binding:"omitempty,oneof=active inactive"`
}

// UpdateCategoryRequest represents update category request DTO
type UpdateCategoryRequest struct {
	Name        *string `json:"name,omitempty" binding:"omitempty,min=1,max=255"`
	Description *string `json:"description,omitempty"`
	Status      *string `json:"status,omitempty" binding:"omitempty,oneof=active inactive"`
}

// ListCategoriesRequest represents list categories query parameters
type ListCategoriesRequest struct {
	Page   int         `form:"page" binding:"omitempty,min=1"`
	PerPage int        `form:"per_page" binding:"omitempty,min=1,max=100"`
	Type   CategoryType `form:"type" binding:"omitempty,oneof=diagnosis procedure"`
	Status string      `form:"status" binding:"omitempty,oneof=active inactive"`
	Search string      `form:"search" binding:"omitempty"`
}

