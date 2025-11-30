package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/role"
)

// SeedRoles seeds initial roles
func SeedRoles() error {
	// Check if roles already exist
	var count int64
	database.DB.Model(&role.Role{}).Count(&count)
	if count > 0 {
		log.Println("Roles already seeded, skipping...")
		return nil
	}

	roles := []role.Role{
		{
			Name:        "Admin",
			Code:        "admin",
			Description: "Administrator with full access",
			Status:      "active",
		},
		{
			Name:        "Doctor",
			Code:        "doctor",
			Description: "Doctor role for medical operations",
			Status:      "active",
		},
		{
			Name:        "Pharmacist",
			Code:        "pharmacist",
			Description: "Pharmacist role for pharmacy operations",
			Status:      "active",
		},
		{
			Name:        "Viewer",
			Code:        "viewer",
			Description: "Viewer role with read-only access",
			Status:      "active",
		},
	}

	for _, r := range roles {
		if err := database.DB.Create(&r).Error; err != nil {
			return err
		}
		log.Printf("Created role: %s (%s)", r.Name, r.Code)
	}

	log.Println("Roles seeded successfully")
	return nil
}

