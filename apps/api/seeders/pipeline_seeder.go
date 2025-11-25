package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
)

// SeedPipelineStages seeds pipeline stages
func SeedPipelineStages() error {
	stages := []pipeline.PipelineStage{
		{
			Name:        "Lead",
			Code:        "lead",
			Order:       1,
			Color:       "#94A3B8",
			IsActive:    true,
			IsWon:       false,
			IsLost:      false,
			Description: "New lead that needs qualification",
		},
		{
			Name:        "Qualification",
			Code:        "qualification",
			Order:       2,
			Color:       "#3B82F6",
			IsActive:    true,
			IsWon:       false,
			IsLost:      false,
			Description: "Qualifying the lead to determine if it's a good fit",
		},
		{
			Name:        "Proposal",
			Code:        "proposal",
			Order:       3,
			Color:       "#8B5CF6",
			IsActive:    true,
			IsWon:       false,
			IsLost:      false,
			Description: "Proposal sent to the prospect",
		},
		{
			Name:        "Negotiation",
			Code:        "negotiation",
			Order:       4,
			Color:       "#F59E0B",
			IsActive:    true,
			IsWon:       false,
			IsLost:      false,
			Description: "Negotiating terms and pricing",
		},
		{
			Name:        "Closed Won",
			Code:        "closed_won",
			Order:       5,
			Color:       "#10B981",
			IsActive:    true,
			IsWon:       true,
			IsLost:      false,
			Description: "Deal successfully closed",
		},
		{
			Name:        "Closed Lost",
			Code:        "closed_lost",
			Order:       6,
			Color:       "#EF4444",
			IsActive:    true,
			IsWon:       false,
			IsLost:      true,
			Description: "Deal lost or cancelled",
		},
	}

	for _, stage := range stages {
		var existing pipeline.PipelineStage
		err := database.DB.Where("code = ?", stage.Code).First(&existing).Error
		if err == nil {
			// Stage already exists, skip
			continue
		}

		if err := database.DB.Create(&stage).Error; err != nil {
			log.Printf("Error seeding pipeline stage %s: %v", stage.Code, err)
			return err
		}
		log.Printf("Seeded pipeline stage: %s", stage.Name)
	}

	return nil
}

