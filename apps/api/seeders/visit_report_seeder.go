package seeders

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/contact"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
	"gorm.io/datatypes"
)

// SeedVisitReports seeds initial visit reports
func SeedVisitReports() error {
	// Check if visit reports already exist
	var count int64
	database.DB.Model(&visit_report.VisitReport{}).Count(&count)
	if count > 0 {
		log.Println("Visit reports already seeded, skipping...")
		return nil
	}

	// Get accounts
	var accounts []account.Account
	if err := database.DB.Find(&accounts).Error; err != nil {
		return err
	}
	if len(accounts) == 0 {
		log.Println("Warning: No accounts found, skipping visit report seeding")
		return nil
	}

	// Get contacts
	var contacts []contact.Contact
	if err := database.DB.Find(&contacts).Error; err != nil {
		return err
	}

	// Get users (sales reps)
	var users []user.User
	if err := database.DB.Find(&users).Error; err != nil {
		return err
	}
	if len(users) == 0 {
		log.Println("Warning: No users found, skipping visit report seeding")
		return nil
	}

	// Helper function to marshal location
	marshalLocation := func(lat, lng float64, address string) datatypes.JSON {
		loc := visit_report.Location{
			Latitude:  lat,
			Longitude: lng,
			Address:   address,
		}
		bytes, _ := json.Marshal(loc)
		return bytes
	}

	// Helper function to marshal photos
	marshalPhotos := func(urls []string) datatypes.JSON {
		bytes, _ := json.Marshal(urls)
		return bytes
	}

	// Get current time for check-in/out
	now := time.Now()
	twoDaysAgo := now.AddDate(0, 0, -2)
	oneDayAgo := now.AddDate(0, 0, -1)
	yesterday := now.AddDate(0, 0, -1)
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	visitReports := []visit_report.VisitReport{}

	// Visit Report 1: Draft visit to first account
	if len(accounts) > 0 && len(users) > 0 {
		var contactID *string
		if len(contacts) > 0 {
			contactID = &contacts[0].ID
		}
		accountID := accounts[0].ID
		visitReports = append(visitReports, visit_report.VisitReport{
			AccountID:  &accountID, // Convert string to *string
			ContactID: contactID,
			SalesRepID: users[0].ID,
			VisitDate:  today,
			Purpose:    "Product presentation for new cardiovascular medications",
			Notes:      "Scheduled meeting to discuss new product line. Need to prepare samples and pricing information.",
			Status:     "draft",
		})
	}

	// Visit Report 2: Submitted visit with check-in
	if len(accounts) > 0 && len(users) > 0 {
		var contactID *string
		if len(contacts) > 1 {
			contactID = &contacts[1].ID
		}
		checkInTime := yesterday.Add(9 * time.Hour) // 9 AM yesterday
		accountID := accounts[0].ID
		visitReports = append(visitReports, visit_report.VisitReport{
			AccountID:       &accountID, // Convert string to *string
			ContactID:      contactID,
			SalesRepID:     users[0].ID,
			VisitDate:       yesterday,
			CheckInTime:     &checkInTime,
			CheckInLocation: marshalLocation(-6.2088, 106.8456, "Jl. Salemba Raya No. 6, Jakarta Pusat"),
			Purpose:         "Follow-up meeting regarding previous product inquiry",
			Notes:           "Met with procurement manager. Discussed pricing and delivery schedule. Positive response.",
			Status:          "submitted",
		})
	}

	// Visit Report 3: Approved visit with check-in and check-out
	if len(accounts) > 1 && len(users) > 0 {
		var contactID *string
		if len(contacts) > 2 {
			contactID = &contacts[2].ID
		}
		checkInTime := twoDaysAgo.Add(10 * time.Hour)   // 10 AM two days ago
		checkOutTime := twoDaysAgo.Add(11 * time.Hour)  // 11 AM two days ago
		approvedAt := twoDaysAgo.Add(14 * time.Hour)     // 2 PM two days ago
		var approvedBy *string
		if len(users) > 0 {
			approvedBy = &users[0].ID
		}
		accountID := accounts[1].ID
		visitReports = append(visitReports, visit_report.VisitReport{
			AccountID:        &accountID, // Convert string to *string
			ContactID:       contactID,
			SalesRepID:      users[0].ID,
			VisitDate:        twoDaysAgo,
			CheckInTime:      &checkInTime,
			CheckOutTime:     &checkOutTime,
			CheckInLocation:  marshalLocation(-6.1944, 106.8229, "Jl. Diponegoro No. 71, Jakarta Pusat"),
			CheckOutLocation: marshalLocation(-6.1944, 106.8229, "Jl. Diponegoro No. 71, Jakarta Pusat"),
			Purpose:          "Product demonstration and training session",
			Notes:            "Conducted product demo for medical staff. Training session went well. Received positive feedback.",
			Photos:           marshalPhotos([]string{"https://example.com/photos/visit-001.jpg", "https://example.com/photos/visit-002.jpg"}),
			Status:           "approved",
			ApprovedBy:       approvedBy,
			ApprovedAt:      &approvedAt,
		})
	}

	// Visit Report 4: Rejected visit
	if len(accounts) > 2 && len(users) > 0 {
		var contactID *string
		if len(contacts) > 3 {
			contactID = &contacts[3].ID
		}
		checkInTime := oneDayAgo.Add(13 * time.Hour) // 1 PM one day ago
		rejectedAt := oneDayAgo.Add(16 * time.Hour) // 4 PM one day ago
		var rejectedBy *string
		if len(users) > 0 {
			rejectedBy = &users[0].ID
		}
		rejectionReason := "Incomplete documentation. Missing required photos and detailed notes."
		accountID := accounts[2].ID
		visitReports = append(visitReports, visit_report.VisitReport{
			AccountID:       &accountID, // Convert string to *string
			ContactID:      contactID,
			SalesRepID:     users[0].ID,
			VisitDate:       oneDayAgo,
			CheckInTime:     &checkInTime,
			CheckInLocation: marshalLocation(-6.2297, 106.7986, "Jl. Metro Duta Kav. UE, Jakarta Selatan"),
			Purpose:         "Initial contact and product introduction",
			Notes:           "Brief meeting with contact person. Discussed basic product information.",
			Status:          "rejected",
			ApprovedBy:      rejectedBy,
			ApprovedAt:      &rejectedAt,
			RejectionReason: &rejectionReason,
		})
	}

	// Visit Report 5: Submitted visit with photos
	if len(accounts) > 3 && len(users) > 0 {
		var contactID *string
		if len(contacts) > 4 {
			contactID = &contacts[4].ID
		}
		checkInTime := yesterday.Add(14 * time.Hour) // 2 PM yesterday
		accountID := accounts[3].ID
		visitReports = append(visitReports, visit_report.VisitReport{
			AccountID:       &accountID, // Convert string to *string
			ContactID:      contactID,
			SalesRepID:     users[0].ID,
			VisitDate:       yesterday,
			CheckInTime:     &checkInTime,
			CheckInLocation: marshalLocation(-6.2297, 106.7986, "Jl. Sudirman No. 123, Jakarta Selatan"),
			Purpose:         "Quarterly review meeting",
			Notes:           "Quarterly business review. Discussed sales performance and upcoming promotions. Took photos of product display.",
			Photos:          marshalPhotos([]string{"https://example.com/photos/visit-003.jpg"}),
			Status:          "submitted",
		})
	}

	// Visit Report 6: Draft visit for today
	if len(accounts) > 4 && len(users) > 0 {
		var contactID *string
		if len(contacts) > 5 {
			contactID = &contacts[5].ID
		}
		accountID := accounts[4].ID
		visitReports = append(visitReports, visit_report.VisitReport{
			AccountID:  &accountID, // Convert string to *string
			ContactID:  contactID,
			SalesRepID: users[0].ID,
			VisitDate:  today,
			Purpose:    "New product launch presentation",
			Notes:      "Planning to present new product line. Need to prepare marketing materials.",
			Status:     "draft",
		})
	}

	// Create visit reports
	for _, vr := range visitReports {
		if err := database.DB.Create(&vr).Error; err != nil {
			return err
		}
		accountIDStr := "nil"
		if vr.AccountID != nil {
			accountIDStr = *vr.AccountID
		}
		log.Printf("Created visit report: %s (id: %s, account_id: %s, status: %s)", vr.Purpose, vr.ID, accountIDStr, vr.Status)
	}

	log.Printf("Visit reports seeded successfully (%d visit reports created)", len(visitReports))
	return nil
}

