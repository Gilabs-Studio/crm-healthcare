package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
)

// SeedAccounts seeds initial accounts
func SeedAccounts() error {
	// Check if accounts already exist
	var count int64
	database.DB.Model(&account.Account{}).Count(&count)
	if count > 0 {
		log.Println("Accounts already seeded, skipping...")
		return nil
	}

	// Get admin user for assigned_to (sales rep)
	var adminUser user.User
	adminUserID := ""
	if err := database.DB.Where("email = ?", "admin@example.com").First(&adminUser).Error; err != nil {
		log.Printf("Warning: Admin user not found, accounts will be created without assigned_to: %v", err)
	} else {
		adminUserID = adminUser.ID
	}

	accounts := []account.Account{
		{
			Name:       "Rumah Sakit Umum Daerah Jakarta",
			Category:   "hospital",
			Address:    "Jl. Salemba Raya No. 6, Jakarta Pusat",
			City:       "Jakarta Pusat",
			Province:   "DKI Jakarta",
			Phone:      "+6281234567890",
			Email:      "info@rsud-jakarta.go.id",
			Status:     "active",
			AssignedTo: adminUserID,
		},
		{
			Name:       "Rumah Sakit Cipto Mangunkusumo",
			Category:   "hospital",
			Address:    "Jl. Diponegoro No. 71, Jakarta Pusat",
			City:       "Jakarta Pusat",
			Province:   "DKI Jakarta",
			Phone:      "+6281234567891",
			Email:      "info@rscm.go.id",
			Status:     "active",
			AssignedTo: adminUserID,
		},
		{
			Name:       "Klinik Sehat Sentosa",
			Category:   "clinic",
			Address:    "Jl. Sudirman No. 123, Jakarta Selatan",
			City:       "Jakarta Selatan",
			Province:   "DKI Jakarta",
			Phone:      "+6281234567892",
			Email:      "info@kliniksehatsentosa.com",
			Status:     "active",
			AssignedTo: adminUserID,
		},
		{
			Name:       "Klinik Medika Pratama",
			Category:   "clinic",
			Address:    "Jl. Gatot Subroto No. 45, Jakarta Selatan",
			City:       "Jakarta Selatan",
			Province:   "DKI Jakarta",
			Phone:      "+6281234567893",
			Email:      "info@medikapratama.com",
			Status:     "active",
			AssignedTo: adminUserID,
		},
		{
			Name:       "Apotek Kimia Farma Cabang Thamrin",
			Category:   "pharmacy",
			Address:    "Jl. MH Thamrin No. 1, Jakarta Pusat",
			City:       "Jakarta Pusat",
			Province:   "DKI Jakarta",
			Phone:      "+6281234567894",
			Email:      "thamrin@kimiafarma.co.id",
			Status:     "active",
			AssignedTo: adminUserID,
		},
		{
			Name:       "Apotek Guardian Plaza Indonesia",
			Category:   "pharmacy",
			Address:    "Jl. MH Thamrin Kav. 28-30, Jakarta Pusat",
			City:       "Jakarta Pusat",
			Province:   "DKI Jakarta",
			Phone:      "+6281234567895",
			Email:      "plaza@guardian.co.id",
			Status:     "active",
			AssignedTo: adminUserID,
		},
		{
			Name:       "Rumah Sakit Pondok Indah",
			Category:   "hospital",
			Address:    "Jl. Metro Duta Kav. UE, Jakarta Selatan",
			City:       "Jakarta Selatan",
			Province:   "DKI Jakarta",
			Phone:      "+6281234567896",
			Email:      "info@rspondokindah.co.id",
			Status:     "active",
			AssignedTo: adminUserID,
		},
		{
			Name:       "Klinik Bunda Sejahtera",
			Category:   "clinic",
			Address:    "Jl. Kebayoran Baru No. 78, Jakarta Selatan",
			City:       "Jakarta Selatan",
			Province:   "DKI Jakarta",
			Phone:      "+6281234567897",
			Email:      "info@bundasejahtera.com",
			Status:     "active",
			AssignedTo: adminUserID,
		},
	}

	for _, acc := range accounts {
		if err := database.DB.Create(&acc).Error; err != nil {
			return err
		}
		log.Printf("Created account: %s (id: %s, category: %s)", acc.Name, acc.ID, acc.Category)
	}

	log.Println("Accounts seeded successfully")
	return nil
}

