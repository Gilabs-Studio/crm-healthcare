package settings

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Settings represents system settings entity
type Settings struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Key       string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	Category  string    `gorm:"type:varchar(100);not null;index" json:"category"` // general, notifications, pipeline
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Settings
func (Settings) TableName() string {
	return "settings"
}

// BeforeCreate hook to generate UUID
func (s *Settings) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return nil
}

// SettingsResponse represents settings response DTO
type SettingsResponse struct {
	ID        string    `json:"id"`
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	Category  string    `json:"category"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ToSettingsResponse converts Settings to SettingsResponse
func (s *Settings) ToSettingsResponse() *SettingsResponse {
	return &SettingsResponse{
		ID:        s.ID,
		Key:       s.Key,
		Value:     s.Value,
		Category:  s.Category,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}
}

// GetSettingsResponse represents the response for GET /api/v1/settings
type GetSettingsResponse struct {
	General       map[string]string `json:"general"`
	Notifications map[string]string `json:"notifications"`
	Pipeline      map[string]string `json:"pipeline"`
}

// UpdateSettingsRequest represents update settings request DTO
type UpdateSettingsRequest struct {
	General       map[string]string `json:"general" binding:"omitempty"`
	Notifications map[string]string `json:"notifications" binding:"omitempty"`
	Pipeline      map[string]string `json:"pipeline" binding:"omitempty"`
}


