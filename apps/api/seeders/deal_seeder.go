package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
)

// SeedDeals seeds initial deals data for pipeline and dashboard widgets.
// Note: Deals should come from Lead Conversion, not created directly via seeder.
// This seeder is intentionally empty - deals should be created by converting leads.
func SeedDeals() error {
	// Check if deals already exist
	var count int64
	database.DB.Model(&pipeline.Deal{}).Count(&count)
	if count > 0 {
		log.Println("Deals already exist, skipping...")
		return nil
	}

	// No deals to seed - deals should be created from Lead Conversion
	// This ensures proper CRM flow: Leads -> Convert to Deals -> Enter Pipeline
	log.Println("No deals seeded - deals should be created from Lead Conversion")
	return nil
}


