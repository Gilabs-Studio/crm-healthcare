package settings

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/settings"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
)

var (
	ErrSettingNotFound = errors.New("setting not found")
)

type Service struct {
	settingsRepo interfaces.SettingsRepository
}

func NewService(settingsRepo interfaces.SettingsRepository) *Service {
	return &Service{
		settingsRepo: settingsRepo,
	}
}

// GetSettings returns all settings grouped by category
func (s *Service) GetSettings() (*settings.GetSettingsResponse, error) {
	allSettings, err := s.settingsRepo.FindAll()
	if err != nil {
		return nil, err
	}

	response := &settings.GetSettingsResponse{
		General:       make(map[string]string),
		Notifications: make(map[string]string),
		Pipeline:      make(map[string]string),
	}

	for _, setting := range allSettings {
		switch setting.Category {
		case "general":
			response.General[setting.Key] = setting.Value
		case "notifications":
			response.Notifications[setting.Key] = setting.Value
		case "pipeline":
			response.Pipeline[setting.Key] = setting.Value
		}
	}

	return response, nil
}

// UpdateSettings updates settings by category
func (s *Service) UpdateSettings(req *settings.UpdateSettingsRequest) (*settings.GetSettingsResponse, error) {
	// Update general settings
	if req.General != nil {
		for key, value := range req.General {
			setting := &settings.Settings{
				Key:      key,
				Value:    value,
				Category: "general",
			}
			if err := s.settingsRepo.Upsert(setting); err != nil {
				return nil, err
			}
		}
	}

	// Update notification settings
	if req.Notifications != nil {
		for key, value := range req.Notifications {
			setting := &settings.Settings{
				Key:      key,
				Value:    value,
				Category: "notifications",
			}
			if err := s.settingsRepo.Upsert(setting); err != nil {
				return nil, err
			}
		}
	}

	// Update pipeline settings
	if req.Pipeline != nil {
		for key, value := range req.Pipeline {
			setting := &settings.Settings{
				Key:      key,
				Value:    value,
				Category: "pipeline",
			}
			if err := s.settingsRepo.Upsert(setting); err != nil {
				return nil, err
			}
		}
	}

	// Return updated settings
	return s.GetSettings()
}

