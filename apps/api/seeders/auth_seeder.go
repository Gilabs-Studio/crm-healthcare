package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/auth"
	"golang.org/x/crypto/bcrypt"
)

// SeedUsers seeds initial users
func SeedUsers() error {
	// Check if users already exist
	var count int64
	database.DB.Model(&auth.User{}).Count(&count)
	if count > 0 {
		log.Println("Users already seeded, skipping...")
		return nil
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	users := []auth.User{
		{
			Email:    "admin@example.com",
			Password: string(hashedPassword),
			Name:     "Admin User",
			Role:     "admin",
			Status:   "active",
		},
		{
			Email:    "doctor@example.com",
			Password: string(hashedPassword),
			Name:     "Doctor User",
			Role:     "doctor",
			Status:   "active",
		},
		{
			Email:    "pharmacist@example.com",
			Password: string(hashedPassword),
			Name:     "Pharmacist User",
			Role:     "pharmacist",
			Status:   "active",
		},
	}

	for _, user := range users {
		if err := database.DB.Create(&user).Error; err != nil {
			return err
		}
		log.Printf("Created user: %s (%s)", user.Email, user.Role)
	}

	log.Println("Users seeded successfully")
	return nil
}

