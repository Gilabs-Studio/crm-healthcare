package diagnosis

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Diagnosis represents a diagnosis entity (ICD-10)
type Diagnosis struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Code        string    `gorm:"type:varchar(20);uniqueIndex;not null" json:"code"`
	Name        string    `gorm:"type:varchar(500);not null" json:"name"`
	NameEn      *string   `gorm:"type:varchar(500)" json:"name_en,omitempty"`
	Category    *string   `gorm:"type:varchar(100)" json:"category,omitempty"`
	Description *string   `gorm:"type:text" json:"description,omitempty"`
	Status      string    `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Diagnosis
func (Diagnosis) TableName() string {
	return "diagnoses"
}

// BeforeCreate hook to generate UUID
func (d *Diagnosis) BeforeCreate(tx *gorm.DB) error {
	if d.ID == "" {
		d.ID = uuid.New().String()
	}
	return nil
}

// DiagnosisResponse represents diagnosis response DTO
type DiagnosisResponse struct {
	ID          string    `json:"id"`
	Code        string    `json:"code"`
	Name        string    `json:"name"`
	NameEn      *string   `json:"name_en,omitempty"`
	Category    *string   `json:"category,omitempty"`
	Description *string   `json:"description,omitempty"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToDiagnosisResponse converts Diagnosis to DiagnosisResponse
func (d *Diagnosis) ToDiagnosisResponse() *DiagnosisResponse {
	return &DiagnosisResponse{
		ID:          d.ID,
		Code:        d.Code,
		Name:        d.Name,
		NameEn:      d.NameEn,
		Category:    d.Category,
		Description: d.Description,
		Status:      d.Status,
		CreatedAt:   d.CreatedAt,
		UpdatedAt:   d.UpdatedAt,
	}
}

// CreateDiagnosisRequest represents create diagnosis request DTO
type CreateDiagnosisRequest struct {
	Code        string  `json:"code" binding:"required,min=1,max=20"`
	Name        string  `json:"name" binding:"required,min=3,max=500"`
	NameEn      *string `json:"name_en" binding:"omitempty,max=500"`
	Category    *string `json:"category" binding:"omitempty,max=100"`
	Description *string `json:"description"`
	Status      string  `json:"status" binding:"omitempty,oneof=active inactive"`
}

// UpdateDiagnosisRequest represents update diagnosis request DTO
type UpdateDiagnosisRequest struct {
	Code        *string `json:"code" binding:"omitempty,min=1,max=20"`
	Name        *string `json:"name" binding:"omitempty,min=3,max=500"`
	NameEn      *string `json:"name_en" binding:"omitempty,max=500"`
	Category    *string `json:"category" binding:"omitempty,max=100"`
	Description *string `json:"description"`
	Status      *string `json:"status" binding:"omitempty,oneof=active inactive"`
}

// ListDiagnosesRequest represents list diagnoses query parameters
type ListDiagnosesRequest struct {
	Page    int    `form:"page" binding:"omitempty,min=1"`
	PerPage int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search  string `form:"search" binding:"omitempty"`
	Status  string `form:"status" binding:"omitempty,oneof=active inactive"`
}

// SearchDiagnosesRequest represents search diagnoses query parameters
type SearchDiagnosesRequest struct {
	Query  string `form:"query" binding:"required,min=1"`
	Limit  int    `form:"limit" binding:"omitempty,min=1,max=50"`
	Status string `form:"status" binding:"omitempty,oneof=active inactive"`
}

