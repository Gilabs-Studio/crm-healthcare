package handlers

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/settings"
	settingsservice "github.com/gilabs/crm-healthcare/api/internal/service/settings"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type SettingsHandler struct {
	settingsService *settingsservice.Service
}

func NewSettingsHandler(settingsService *settingsservice.Service) *SettingsHandler {
	return &SettingsHandler{
		settingsService: settingsService,
	}
}

// GetSettings handles get settings request
func (h *SettingsHandler) GetSettings(c *gin.Context) {
	settingsData, err := h.settingsService.GetSettings()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, settingsData, nil)
}

// UpdateSettings handles update settings request
func (h *SettingsHandler) UpdateSettings(c *gin.Context) {
	var req settings.UpdateSettingsRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	updatedSettings, err := h.settingsService.UpdateSettings(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.UpdatedBy = id
		}
	}

	response.SuccessResponse(c, updatedSettings, meta)
}


