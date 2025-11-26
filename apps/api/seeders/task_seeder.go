package seeders

import (
	"log"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/contact"
	"github.com/gilabs/crm-healthcare/api/internal/domain/task"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
)

// SeedTasks seeds initial tasks data
func SeedTasks() error {
	// Check if tasks already exist
	var count int64
	database.DB.Model(&task.Task{}).Count(&count)
	if count > 0 {
		log.Println("Tasks already seeded, skipping...")
		return nil
	}

	// Get users for AssignedTo and CreatedBy
	var users []user.User
	if err := database.DB.Find(&users).Error; err != nil {
		return err
	}
	if len(users) == 0 {
		log.Println("Warning: No users found, skipping task seeding")
		return nil
	}
	defaultUser := users[0]

	// Get accounts
	var accounts []account.Account
	if err := database.DB.Find(&accounts).Error; err != nil {
		return err
	}

	// Get contacts
	var contacts []contact.Contact
	if err := database.DB.Find(&contacts).Error; err != nil {
		return err
	}

	now := time.Now()
	tomorrow := now.Add(24 * time.Hour)
	nextWeek := now.Add(7 * 24 * time.Hour)

	var accountID1, accountID2, accountID3 string
	if len(accounts) > 0 {
		accountID1 = accounts[0].ID
	}
	if len(accounts) > 1 {
		accountID2 = accounts[1].ID
	}
	if len(accounts) > 2 {
		accountID3 = accounts[2].ID
	}

	var contactID1, contactID2, contactID3 string
	if len(contacts) > 0 {
		contactID1 = contacts[0].ID
	}
	if len(contacts) > 1 {
		contactID2 = contacts[1].ID
	}
	if len(contacts) > 2 {
		contactID3 = contacts[2].ID
	}

	tasks := []task.Task{
		{
			Title:       "Follow up kunjungan RS untuk penawaran produk baru",
			Description: "Hubungi kembali PIC di rumah sakit untuk menindaklanjuti presentasi produk cardiovascular.",
			Type:        "call",
			Status:      "pending",
			Priority:    "high",
			DueDate:     &tomorrow,
			AssignedTo:  &defaultUser.ID,
			AccountID:   &accountID1,
			ContactID:   &contactID1,
			CreatedBy:   defaultUser.ID,
		},
		{
			Title:       "Siapkan proposal kerja sama tahunan",
			Description: "Susun proposal lengkap untuk kontrak suplai tahunan termasuk skema diskon.",
			Type:        "meeting",
			Status:      "in_progress",
			Priority:    "urgent",
			DueDate:     &nextWeek,
			AssignedTo:  &defaultUser.ID,
			AccountID:   &accountID2,
			ContactID:   &contactID2,
			CreatedBy:   defaultUser.ID,
		},
		{
			Title:       "Kirim email materi produk ke apotek",
			Description: "Kirim katalog produk dan brosur promo ke apotek target.",
			Type:        "email",
			Status:      "pending",
			Priority:    "medium",
			DueDate:     &tomorrow,
			AssignedTo:  &defaultUser.ID,
			AccountID:   &accountID3,
			ContactID:   &contactID3,
			CreatedBy:   defaultUser.ID,
		},
	}

	for _, t := range tasks {
		// Skip tasks that don't have minimum required foreign keys
		if t.AccountID == nil {
			continue
		}

		if err := database.DB.Create(&t).Error; err != nil {
			return err
		}
		log.Printf("Created task: %s (id: %s, status: %s, priority: %s)", t.Title, t.ID, t.Status, t.Priority)
	}

	log.Println("Tasks seeded successfully")
	return nil
}



