package settings

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/settings"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new settings repository
func NewRepository(db *gorm.DB) interfaces.SettingsRepository {
	return &repository{db: db}
}

func (r *repository) FindByKey(key string) (*settings.Settings, error) {
	var s settings.Settings
	err := r.db.Where("key = ?", key).First(&s).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *repository) FindByCategory(category string) ([]settings.Settings, error) {
	var settingsList []settings.Settings
	err := r.db.Where("category = ?", category).Find(&settingsList).Error
	if err != nil {
		return nil, err
	}
	return settingsList, nil
}

func (r *repository) FindAll() ([]settings.Settings, error) {
	var settingsList []settings.Settings
	err := r.db.Find(&settingsList).Error
	if err != nil {
		return nil, err
	}
	return settingsList, nil
}

func (r *repository) Create(s *settings.Settings) error {
	return r.db.Create(s).Error
}

func (r *repository) Update(s *settings.Settings) error {
	return r.db.Save(s).Error
}

func (r *repository) Upsert(s *settings.Settings) error {
	// Try to find existing setting
	existing, err := r.FindByKey(s.Key)
	if err != nil && err != gorm.ErrRecordNotFound {
		return err
	}

	if existing != nil {
		// Update existing
		existing.Value = s.Value
		existing.Category = s.Category
		return r.db.Save(existing).Error
	}

	// Create new
	return r.db.Create(s).Error
}

func (r *repository) Delete(key string) error {
	return r.db.Where("key = ?", key).Delete(&settings.Settings{}).Error
}


