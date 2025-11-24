package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/role"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	"golang.org/x/crypto/bcrypt"
)

// SeedUsers seeds initial users
func SeedUsers() error {
	// Check if users already exist
	var count int64
	database.DB.Model(&user.User{}).Count(&count)
	if count > 0 {
		log.Println("Users already seeded, skipping...")
		return nil
	}

	// Get roles
	var adminRole, doctorRole, pharmacistRole role.Role
	if err := database.DB.Where("code = ?", "admin").First(&adminRole).Error; err != nil {
		return err
	}
	if err := database.DB.Where("code = ?", "doctor").First(&doctorRole).Error; err != nil {
		return err
	}
	if err := database.DB.Where("code = ?", "pharmacist").First(&pharmacistRole).Error; err != nil {
		return err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	users := []user.User{
		{
			Email:    "admin@example.com",
			Password: string(hashedPassword),
			Name:     "Admin User",
			AvatarURL: "https://api.dicebear.com/7.x/lorelei/svg?seed=admin@example.com",
			RoleID:   adminRole.ID,
			Status:   "active",
		},
		{
			Email:    "doctor@example.com",
			Password: string(hashedPassword),
			Name:     "Doctor User",
			AvatarURL: "https://api.dicebear.com/7.x/lorelei/svg?seed=doctor@example.com",
			RoleID:   doctorRole.ID,
			Status:   "active",
		},
		{
			Email:    "pharmacist@example.com",
			Password: string(hashedPassword),
			Name:     "Pharmacist User",
			AvatarURL: "https://api.dicebear.com/7.x/lorelei/svg?seed=pharmacist@example.com",
			RoleID:   pharmacistRole.ID,
			Status:   "active",
		},
	}

	for _, u := range users {
		if err := database.DB.Create(&u).Error; err != nil {
			return err
		}
		log.Printf("Created user: %s (role_id: %s)", u.Email, u.RoleID)
	}

	log.Println("Users seeded successfully")
	return nil
}

