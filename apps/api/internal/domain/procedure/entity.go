package procedure

import (
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/category"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Procedure represents a procedure entity
type Procedure struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Code        string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"code"`
	Name        string    `gorm:"type:varchar(500);not null" json:"name"`
	NameEn      *string   `gorm:"type:varchar(500)" json:"name_en,omitempty"`
	CategoryID  *string   `gorm:"type:uuid;index" json:"category_id,omitempty"`
	Category    *category.Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Description *string   `gorm:"type:text" json:"description,omitempty"`
	Price       *int64    `gorm:"type:bigint" json:"price,omitempty"`
	Status      string    `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Procedure
func (Procedure) TableName() string {
	return "procedures"
}

// BeforeCreate hook to generate UUID
func (p *Procedure) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// ProcedureResponse represents procedure response DTO
type ProcedureResponse struct {
	ID          string                 `json:"id"`
	Code        string                 `json:"code"`
	Name        string                 `json:"name"`
	NameEn      *string                `json:"name_en,omitempty"`
	CategoryID  *string                `json:"category_id,omitempty"`
	Category    *category.CategoryResponse `json:"category,omitempty"`
	Description *string                `json:"description,omitempty"`
	Price       *int64                 `json:"price,omitempty"`
	Status      string                 `json:"status"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

// ToProcedureResponse converts Procedure to ProcedureResponse
func (p *Procedure) ToProcedureResponse() *ProcedureResponse {
	resp := &ProcedureResponse{
		ID:          p.ID,
		Code:        p.Code,
		Name:        p.Name,
		NameEn:      p.NameEn,
		CategoryID:  p.CategoryID,
		Description: p.Description,
		Price:       p.Price,
		Status:      p.Status,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
	if p.Category != nil {
		resp.Category = p.Category.ToCategoryResponse()
	}
	return resp
}

// CreateProcedureRequest represents create procedure request DTO
type CreateProcedureRequest struct {
	Code        string  `json:"code" binding:"required,min=1,max=50"`
	Name        string  `json:"name" binding:"required,min=3,max=500"`
	NameEn      *string `json:"name_en" binding:"omitempty,max=500"`
	CategoryID  *string `json:"category_id" binding:"omitempty,uuid"`
	Description *string `json:"description"`
	Price       *int64  `json:"price" binding:"omitempty,min=0"`
	Status      string  `json:"status" binding:"omitempty,oneof=active inactive"`
}

// UpdateProcedureRequest represents update procedure request DTO
type UpdateProcedureRequest struct {
	Code        *string `json:"code" binding:"omitempty,min=1,max=50"`
	Name        *string `json:"name" binding:"omitempty,min=3,max=500"`
	NameEn      *string `json:"name_en" binding:"omitempty,max=500"`
	CategoryID  *string `json:"category_id" binding:"omitempty,uuid"`
	Description *string `json:"description"`
	Price       *int64  `json:"price" binding:"omitempty,min=0"`
	Status      *string `json:"status" binding:"omitempty,oneof=active inactive"`
}

// ListProceduresRequest represents list procedures query parameters
type ListProceduresRequest struct {
	Page    int    `form:"page" binding:"omitempty,min=1"`
	PerPage int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search  string `form:"search" binding:"omitempty"`
	Status  string `form:"status" binding:"omitempty,oneof=active inactive"`
}

// SearchProceduresRequest represents search procedures query parameters
type SearchProceduresRequest struct {
	Query  string `form:"query" binding:"required,min=1"`
	Limit  int    `form:"limit" binding:"omitempty,min=1,max=50"`
	Status string `form:"status" binding:"omitempty,oneof=active inactive"`
}

