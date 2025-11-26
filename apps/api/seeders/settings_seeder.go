package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/settings"
)

// SeedSettings seeds initial settings data
func SeedSettings() error {
	// Check if settings already exist
	var count int64
	database.DB.Model(&settings.Settings{}).Count(&count)
	if count > 0 {
		log.Println("Settings already seeded, skipping...")
		return nil
	}

	// General settings
	generalSettings := []settings.Settings{
		{Key: "company_name", Value: "CRM Healthcare", Category: "general"},
		{Key: "company_email", Value: "info@crmhealthcare.com", Category: "general"},
		{Key: "company_phone", Value: "+62 123 456 7890", Category: "general"},
		{Key: "company_address", Value: "Jakarta, Indonesia", Category: "general"},
		{Key: "company_logo", Value: "", Category: "general"},
		{Key: "timezone", Value: "Asia/Jakarta", Category: "general"},
		{Key: "date_format", Value: "DD/MM/YYYY", Category: "general"},
		{Key: "currency", Value: "IDR", Category: "general"},
	}

	// Notification settings
	notificationSettings := []settings.Settings{
		{Key: "email_notifications", Value: "true", Category: "notifications"},
		{Key: "sms_notifications", Value: "false", Category: "notifications"},
		{Key: "push_notifications", Value: "true", Category: "notifications"},
		{Key: "visit_report_notifications", Value: "true", Category: "notifications"},
		{Key: "task_reminder_notifications", Value: "true", Category: "notifications"},
		{Key: "pipeline_update_notifications", Value: "true", Category: "notifications"},
	}

	// Pipeline settings
	pipelineStages := `[{"id":"1","name":"Lead","order":1},{"id":"2","name":"Qualified","order":2},{"id":"3","name":"Proposal","order":3},{"id":"4","name":"Negotiation","order":4},{"id":"5","name":"Won","order":5},{"id":"6","name":"Lost","order":6}]`
	pipelineSettings := []settings.Settings{
		{Key: "stages", Value: pipelineStages, Category: "pipeline"},
		{Key: "default_stage", Value: "1", Category: "pipeline"},
		{Key: "auto_advance", Value: "false", Category: "pipeline"},
	}

	// Create all settings
	allSettings := append(generalSettings, append(notificationSettings, pipelineSettings...)...)

	for _, setting := range allSettings {
		if err := database.DB.Create(&setting).Error; err != nil {
			return err
		}
		log.Printf("Created setting: %s (%s)", setting.Key, setting.Category)
	}

	log.Println("Settings seeded successfully")
	return nil
}


