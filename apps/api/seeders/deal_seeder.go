package seeders

import (
	"log"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/contact"
	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
)

// SeedDeals seeds initial deals data for pipeline and dashboard widgets.
// This seeder intentionally links to existing accounts, contacts, users, and
// pipeline stages so that "Leads by Source", "Leads" table, and revenue
// statistics have realistic demo data.
func SeedDeals() error {
	// Check if deals already exist
	var count int64
	database.DB.Model(&pipeline.Deal{}).Count(&count)
	if count > 0 {
		log.Println("Deals already seeded, skipping...")
		return nil
	}

	// Get at least one user to act as sales rep / creator
	var users []user.User
	if err := database.DB.Find(&users).Error; err != nil {
		return err
	}
	if len(users) == 0 {
		log.Println("Warning: no users found, skipping deal seeding")
		return nil
	}
	defaultUser := users[0]

	// Get some accounts and contacts
	var accounts []account.Account
	if err := database.DB.Find(&accounts).Error; err != nil {
		return err
	}
	if len(accounts) == 0 {
		log.Println("Warning: no accounts found, skipping deal seeding")
		return nil
	}

	var contacts []contact.Contact
	if err := database.DB.Find(&contacts).Error; err != nil {
		return err
	}

	// Get pipeline stages by code
	var leadStage, qualificationStage, proposalStage, negotiationStage, closedWonStage, closedLostStage pipeline.PipelineStage
	if err := database.DB.Where("code = ?", "lead").First(&leadStage).Error; err != nil {
		return err
	}
	if err := database.DB.Where("code = ?", "qualification").First(&qualificationStage).Error; err != nil {
		return err
	}
	if err := database.DB.Where("code = ?", "proposal").First(&proposalStage).Error; err != nil {
		return err
	}
	if err := database.DB.Where("code = ?", "negotiation").First(&negotiationStage).Error; err != nil {
		return err
	}
	if err := database.DB.Where("code = ?", "closed_won").First(&closedWonStage).Error; err != nil {
		return err
	}
	if err := database.DB.Where("code = ?", "closed_lost").First(&closedLostStage).Error; err != nil {
		return err
	}

	// Helper to safely get contact ID if available
	getContactID := func(index int) string {
		if len(contacts) == 0 {
			return ""
		}
		if index >= 0 && index < len(contacts) {
			return contacts[index].ID
		}
		return contacts[0].ID
	}

	now := time.Now()
	nextMonth := now.AddDate(0, 1, 0)

	// Values are stored in smallest currency unit (sen), so multiply by 100
	deals := []pipeline.Deal{
		// Open leads with different sources
		{
			Title:       "Lead - Social campaign RSUD Jakarta",
			Description: "Lead dari kampanye sosial media untuk paket obat cardiovascular.",
			AccountID:   accounts[0].ID,
			ContactID:   getContactID(0),
			StageID:     leadStage.ID,
			Value:       5000000000, // Rp 50.000.000
			Probability: 10,
			ExpectedCloseDate: &nextMonth,
			AssignedTo:  defaultUser.ID,
			Status:      "open",
			Source:      "social",
			Notes:       "Perlu follow up presentasi produk.",
			CreatedBy:   defaultUser.ID,
		},
		{
			Title:       "Lead - Email campaign Klinik Sehat Sentosa",
			Description: "Response dari email blast ke klinik-klinik area Jakarta.",
			AccountID:   accounts[2].ID,
			ContactID:   getContactID(1),
			StageID:     leadStage.ID,
			Value:       3000000000, // Rp 30.000.000
			Probability: 15,
			ExpectedCloseDate: &nextMonth,
			AssignedTo:  defaultUser.ID,
			Status:      "open",
			Source:      "email",
			Notes:       "Tertarik dengan paket antibiotik.",
			CreatedBy:   defaultUser.ID,
		},
		{
			Title:       "Lead - Cold call Apotek Kimia Farma",
			Description: "Lead dari aktivitas cold call ke apotek besar.",
			AccountID:   accounts[4].ID,
			ContactID:   getContactID(2),
			StageID:     leadStage.ID,
			Value:       2000000000, // Rp 20.000.000
			Probability: 20,
			ExpectedCloseDate: &nextMonth,
			AssignedTo:  defaultUser.ID,
			Status:      "open",
			Source:      "call",
			Notes:       "Perlu kirimkan price list lengkap.",
			CreatedBy:   defaultUser.ID,
		},
		{
			Title:       "Lead - Other source Rumah Sakit Pondok Indah",
			Description: "Lead dari referensi internal manajemen RS.",
			AccountID:   accounts[6].ID,
			ContactID:   getContactID(3),
			StageID:     leadStage.ID,
			Value:       4000000000, // Rp 40.000.000
			Probability: 25,
			ExpectedCloseDate: &nextMonth,
			AssignedTo:  defaultUser.ID,
			Status:      "open",
			Source:      "other",
			Notes:       "Peluang besar untuk kontrak tahunan.",
			CreatedBy:   defaultUser.ID,
		},

		// Deals in middle stages
		{
			Title:       "Proposal - Paket onkologi RSCM",
			Description: "Proposal pengadaan obat onkologi untuk departemen kanker.",
			AccountID:   accounts[1].ID,
			ContactID:   getContactID(4),
			StageID:     proposalStage.ID,
			Value:       15000000000, // Rp 150.000.000
			Probability: 60,
			ExpectedCloseDate: &nextMonth,
			AssignedTo:  defaultUser.ID,
			Status:      "open",
			Source:      "email",
			Notes:       "Menunggu persetujuan komite.",
			CreatedBy:   defaultUser.ID,
		},
		{
			Title:       "Negotiation - Kontrak tahunan Apotek Guardian",
			Description: "Negosiasi diskon volume untuk suplai tahunan.",
			AccountID:   accounts[5].ID,
			ContactID:   getContactID(5),
			StageID:     negotiationStage.ID,
			Value:       10000000000, // Rp 100.000.000
			Probability: 70,
			ExpectedCloseDate: &nextMonth,
			AssignedTo:  defaultUser.ID,
			Status:      "open",
			Source:      "social",
			Notes:       "Diskon tambahan 3% diminta oleh klien.",
			CreatedBy:   defaultUser.ID,
		},

		// Closed won & lost (untuk revenue statistik)
		{
			Title:       "Closed Won - Kontrak RSUD Jakarta 2024",
			Description: "Kontrak berhasil ditandatangani untuk suplai obat cardiovascular.",
			AccountID:   accounts[0].ID,
			ContactID:   getContactID(0),
			StageID:     closedWonStage.ID,
			Value:       25000000000, // Rp 250.000.000
			Probability: 100,
			ExpectedCloseDate: &nextMonth,
			AssignedTo:  defaultUser.ID,
			Status:      "won",
			Source:      "email",
			Notes:       "Deal besar, jadwalkan visit rutin.",
			CreatedBy:   defaultUser.ID,
		},
		{
			Title:       "Closed Lost - Paket antibiotik Klinik Medika",
			Description: "Kalah tender karena harga kompetitor lebih rendah.",
			AccountID:   accounts[3].ID,
			ContactID:   getContactID(1),
			StageID:     closedLostStage.ID,
			Value:       5000000000, // Rp 50.000.000
			Probability: 0,
			ExpectedCloseDate: &nextMonth,
			AssignedTo:  defaultUser.ID,
			Status:      "lost",
			Source:      "call",
			Notes:       "Evaluasi ulang strategi pricing.",
			CreatedBy:   defaultUser.ID,
		},
	}

	for _, d := range deals {
		if err := database.DB.Create(&d).Error; err != nil {
			return err
		}
		log.Printf("Created deal: %s (id: %s, account_id: %s, stage_id: %s, source: %s, status: %s)",
			d.Title, d.ID, d.AccountID, d.StageID, d.Source, d.Status)
	}

	log.Println("Deals seeded successfully")
	return nil
}


