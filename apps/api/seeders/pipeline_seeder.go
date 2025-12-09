package seeders

import (
	"errors"
	"log"
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
	"gorm.io/gorm"
)

// SeedPipelineStages seeds pipeline stages
// Note: "Lead" stage is NOT included because leads don't go into pipeline.
// Leads are managed in Lead Management module, and only converted leads (deals) enter the pipeline.
// Pipeline stages are for deals/opportunities only.
func SeedPipelineStages() error {
	stages := []pipeline.PipelineStage{
		{
			Name:        "Qualification",
			Code:        "qualification",
			Order:       1,
			Color:       "#3B82F6",
			IsActive:    true,
			IsWon:       false,
			IsLost:      false,
			Description: "Qualifying the opportunity to determine if it's a good fit. This is the first stage after lead conversion.",
		},
		{
			Name:        "Proposal",
			Code:        "proposal",
			Order:       2,
			Color:       "#8B5CF6",
			IsActive:    true,
			IsWon:       false,
			IsLost:      false,
			Description: "Proposal sent to the prospect. Waiting for response.",
		},
		{
			Name:        "Negotiation",
			Code:        "negotiation",
			Order:       3,
			Color:       "#F59E0B",
			IsActive:    true,
			IsWon:       false,
			IsLost:      false,
			Description: "Negotiating terms, pricing, and contract details.",
		},
		{
			Name:        "Closed Won",
			Code:        "closed_won",
			Order:       4,
			Color:       "#10B981",
			IsActive:    true,
			IsWon:       true,
			IsLost:      false,
			Description: "Deal successfully closed and won. Contract signed.",
		},
		{
			Name:        "Closed Lost",
			Code:        "closed_lost",
			Order:       5,
			Color:       "#EF4444",
			IsActive:    true,
			IsWon:       false,
			IsLost:      true,
			Description: "Deal lost or cancelled. Opportunity did not convert.",
		},
	}

	for _, stage := range stages {
		var existing pipeline.PipelineStage
		// Use Unscoped() to check including soft-deleted records
		// This prevents duplicate key errors when a soft-deleted record exists
		err := database.DB.Unscoped().Where("code = ?", stage.Code).First(&existing).Error
		if err == nil {
			// Stage already exists (even if soft-deleted), skip
			log.Printf("Pipeline stage %s already exists, skipping...", stage.Code)
			continue
		}

		// Check if error is "record not found" (expected) or something else
		// If err is nil, stage exists - already handled above
		// If err is ErrRecordNotFound, stage doesn't exist - continue to create
		// Otherwise, it's a real error - return it
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("Error checking pipeline stage %s: %v", stage.Code, err)
			return err
		}
		// err == gorm.ErrRecordNotFound, which is expected - stage doesn't exist yet, continue to create

		if err := database.DB.Create(&stage).Error; err != nil {
			// Handle duplicate key error gracefully (in case of race condition)
			if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "SQLSTATE 23505") {
				log.Printf("Pipeline stage %s already exists (duplicate key), skipping...", stage.Code)
				continue
			}
			log.Printf("Error seeding pipeline stage %s: %v", stage.Code, err)
			return err
		}
		log.Printf("Seeded pipeline stage: %s", stage.Name)
	}

	return nil
}

