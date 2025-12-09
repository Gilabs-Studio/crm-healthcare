package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/lead"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
)

// SeedLeads seeds initial leads
func SeedLeads() error {
	// Check if leads already exist
	var count int64
	database.DB.Model(&lead.Lead{}).Count(&count)
	if count > 0 {
		log.Println("Leads already seeded, skipping...")
		return nil
	}

	// Get users for assigned_to
	var users []user.User
	if err := database.DB.Find(&users).Error; err != nil {
		return err
	}

	if len(users) == 0 {
		log.Println("Warning: No users found, skipping lead seeding")
		return nil
	}

	// Get admin user for created_by
	var adminUser user.User
	if err := database.DB.Where("email = ?", "admin@example.com").First(&adminUser).Error; err != nil {
		log.Printf("Warning: Admin user not found, using first user for created_by: %v", err)
		if len(users) > 0 {
			adminUser = users[0]
		}
	}

	// Assign users for leads (cycle through available users)
	userIndex := 0
	getNextUser := func() *string {
		if len(users) == 0 {
			return nil
		}
		userID := users[userIndex].ID
		userIndex = (userIndex + 1) % len(users)
		return &userID
	}

	leads := []lead.Lead{
		{
			FirstName:   "Budi",
			LastName:    "Santoso",
			CompanyName: "PT Healthcare Indonesia",
			Email:       "budi.santoso@healthcare.id",
			Phone:       "081234567890",
			JobTitle:    "Director",
			Industry:    "Healthcare",
			LeadSource:  "website",
			LeadStatus:  "new",
			LeadScore:   50,
			AssignedTo:  getNextUser(),
			Notes:       "Interested in pharmaceutical products. Requested product catalog.",
			Address:     "Jl. Sudirman No. 123",
			City:        "Jakarta",
			Province:    "DKI Jakarta",
			PostalCode:  "10220",
			Country:     "Indonesia",
			Website:     "https://healthcare.id",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Siti",
			LastName:    "Rahayu",
			CompanyName: "Rumah Sakit Umum Daerah",
			Email:       "siti.rahayu@rsud.example.com",
			Phone:       "081234567891",
			JobTitle:    "Procurement Manager",
			Industry:    "Healthcare",
			LeadSource:  "referral",
			LeadStatus:  "contacted",
			LeadScore:   65,
			AssignedTo:  getNextUser(),
			Notes:       "Referred by existing client. Looking for medical equipment.",
			Address:     "Jl. Gatot Subroto No. 456",
			City:        "Jakarta Selatan",
			Province:    "DKI Jakarta",
			PostalCode:  "12930",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Ahmad",
			LastName:    "Fauzi",
			CompanyName: "Klinik Sehat Jaya",
			Email:       "ahmad.fauzi@kliniksehat.com",
			Phone:       "081234567892",
			JobTitle:    "Owner",
			Industry:    "Healthcare",
			LeadSource:  "cold_call",
			LeadStatus:  "qualified",
			LeadScore:   75,
			AssignedTo:  getNextUser(),
			Notes:       "Qualified lead. Budget confirmed. Ready for proposal.",
			Address:     "Jl. Merdeka No. 789",
			City:        "Bandung",
			Province:    "Jawa Barat",
			PostalCode:  "40111",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Dewi",
			LastName:    "Kartika",
			CompanyName: "Apotek Sejahtera",
			Email:       "dewi.kartika@apoteksejahtera.com",
			Phone:       "081234567893",
			JobTitle:    "Manager",
			Industry:    "Pharmaceutical",
			LeadSource:  "event",
			LeadStatus:  "new",
			LeadScore:   45,
			AssignedTo:  getNextUser(),
			Notes:       "Met at healthcare exhibition. Interested in bulk purchasing.",
			Address:     "Jl. Ahmad Yani No. 321",
			City:        "Surabaya",
			Province:    "Jawa Timur",
			PostalCode:  "60231",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Rudi",
			LastName:    "Hermawan",
			CompanyName: "PT Medika Sentosa",
			Email:       "rudi.hermawan@medikasentosa.com",
			Phone:       "081234567894",
			JobTitle:    "CEO",
			Industry:    "Healthcare",
			LeadSource:  "social_media",
			LeadStatus:  "contacted",
			LeadScore:   55,
			AssignedTo:  getNextUser(),
			Notes:       "Contacted via LinkedIn. Interested in partnership opportunities.",
			Address:     "Jl. Thamrin No. 654",
			City:        "Jakarta Pusat",
			Province:    "DKI Jakarta",
			PostalCode:  "10230",
			Country:     "Indonesia",
			Website:     "https://medikasentosa.com",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Maya",
			LastName:    "Sari",
			CompanyName: "Rumah Sakit Swasta",
			Email:       "maya.sari@rsswasta.com",
			Phone:       "081234567895",
			JobTitle:    "Purchasing Director",
			Industry:    "Healthcare",
			LeadSource:  "email_campaign",
			LeadStatus:  "qualified",
			LeadScore:   80,
			AssignedTo:  getNextUser(),
			Notes:       "Responded to email campaign. High interest. Requested demo.",
			Address:     "Jl. Diponegoro No. 147",
			City:        "Yogyakarta",
			Province:    "DI Yogyakarta",
			PostalCode:  "55221",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Andi",
			LastName:    "Prasetyo",
			CompanyName: "Klinik Pratama",
			Email:       "andi.prasetyo@klinikpratama.com",
			Phone:       "081234567896",
			JobTitle:    "Founder",
			Industry:    "Healthcare",
			LeadSource:  "partner",
			LeadStatus:  "new",
			LeadScore:   60,
			AssignedTo:  getNextUser(),
			Notes:       "Referred by partner company. New clinic opening soon.",
			Address:     "Jl. Pahlawan No. 258",
			City:        "Semarang",
			Province:    "Jawa Tengah",
			PostalCode:  "50125",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Lina",
			LastName:    "Wati",
			CompanyName: "Apotek Mandiri",
			Email:       "lina.wati@apotekmandiri.com",
			Phone:       "081234567897",
			JobTitle:    "Owner",
			Industry:    "Pharmaceutical",
			LeadSource:  "website",
			LeadStatus:  "contacted",
			LeadScore:   50,
			AssignedTo:  getNextUser(),
			Notes:       "Submitted inquiry form on website. Looking for supplier.",
			Address:     "Jl. Veteran No. 369",
			City:        "Medan",
			Province:    "Sumatera Utara",
			PostalCode:  "20111",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Eko",
			LastName:    "Sutrisno",
			CompanyName: "PT Farmasi Sehat",
			Email:       "eko.sutrisno@farmasisehat.com",
			Phone:       "081234567898",
			JobTitle:    "Procurement Manager",
			Industry:    "Pharmaceutical",
			LeadSource:  "referral",
			LeadStatus:  "qualified",
			LeadScore:   70,
			AssignedTo:  getNextUser(),
			Notes:       "Referred by existing client. High volume potential.",
			Address:     "Jl. Hayam Wuruk No. 741",
			City:        "Jakarta Barat",
			Province:    "DKI Jakarta",
			PostalCode:  "11180",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Rina",
			LastName:    "Dewi",
			CompanyName: "Klinik Keluarga Sehat",
			Email:       "rina.dewi@klinikkeluarga.com",
			Phone:       "081234567899",
			JobTitle:    "Manager",
			Industry:    "Healthcare",
			LeadSource:  "cold_call",
			LeadStatus:  "new",
			LeadScore:   40,
			AssignedTo:  getNextUser(),
			Notes:       "Cold call lead. Initial interest shown. Follow up needed.",
			Address:     "Jl. Asia Afrika No. 852",
			City:        "Bandung",
			Province:    "Jawa Barat",
			PostalCode:  "40111",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Bambang",
			LastName:    "Wijaya",
			CompanyName: "PT Farmasi Nusantara",
			Email:       "bambang.wijaya@farmasinusantara.com",
			Phone:       "081234567900",
			JobTitle:    "Procurement Director",
			Industry:    "Pharmaceutical",
			LeadSource:  "website",
			LeadStatus:  "unqualified",
			LeadScore:   30,
			AssignedTo:  getNextUser(),
			Notes:       "Lead does not meet minimum requirements. Budget too small.",
			Address:     "Jl. Gatot Subroto No. 100",
			City:        "Jakarta Selatan",
			Province:    "DKI Jakarta",
			PostalCode:  "12930",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Sari",
			LastName:    "Indrawati",
			CompanyName: "Klinik Pratama Sejahtera",
			Email:       "sari.indrawati@kliniksejahtera.com",
			Phone:       "081234567901",
			JobTitle:    "Owner",
			Industry:    "Healthcare",
			LeadSource:  "email_campaign",
			LeadStatus:  "nurturing",
			LeadScore:   55,
			AssignedTo:  getNextUser(),
			Notes:       "Lead in nurturing phase. Sending regular updates and educational content.",
			Address:     "Jl. Merdeka No. 200",
			City:        "Surabaya",
			Province:    "Jawa Timur",
			PostalCode:  "60231",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
		{
			FirstName:   "Joko",
			LastName:    "Susilo",
			CompanyName: "Apotek Mandiri Jaya",
			Email:       "joko.susilo@apotekmandiri.com",
			Phone:       "081234567902",
			JobTitle:    "Manager",
			Industry:    "Pharmaceutical",
			LeadSource:  "referral",
			LeadStatus:  "disqualified",
			LeadScore:   25,
			AssignedTo:  getNextUser(),
			Notes:       "Lead disqualified. Company policy does not allow partnership with our type of business.",
			Address:     "Jl. Sudirman No. 500",
			City:        "Medan",
			Province:    "Sumatera Utara",
			PostalCode:  "20111",
			Country:     "Indonesia",
			CreatedBy:   adminUser.ID,
		},
	}

	// Use Omit to skip empty UUID fields (AccountID, ContactID, OpportunityID, ConvertedBy)
	// This prevents PostgreSQL error: invalid input syntax for type uuid: ""
	// By omitting these fields, GORM will set them as NULL instead of empty string
	if err := database.DB.Omit("AccountID", "ContactID", "OpportunityID", "ConvertedBy", "ConvertedAt").Create(&leads).Error; err != nil {
		return err
	}

	log.Printf("✅ Seeded %d leads successfully", len(leads))
	return nil
}

