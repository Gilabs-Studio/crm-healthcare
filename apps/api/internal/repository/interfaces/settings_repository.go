package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/settings"
)

// SettingsRepository defines the interface for settings repository
type SettingsRepository interface {
	// FindByKey finds a setting by key
	FindByKey(key string) (*settings.Settings, error)
	
	// FindByCategory finds all settings by category
	FindByCategory(category string) ([]settings.Settings, error)
	
	// FindAll finds all settings
	FindAll() ([]settings.Settings, error)
	
	// Create creates a new setting
	Create(setting *settings.Settings) error
	
	// Update updates a setting
	Update(setting *settings.Settings) error
	
	// Upsert creates or updates a setting by key
	Upsert(setting *settings.Settings) error
	
	// Delete deletes a setting
	Delete(key string) error
}


