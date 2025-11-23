package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/procedure"
)

// SeedProcedures seeds initial procedure data
func SeedProcedures() error {
	// Check if procedures already exist
	var count int64
	database.DB.Model(&procedure.Procedure{}).Count(&count)
	if count > 0 {
		log.Println("Procedures already seeded, skipping...")
		return nil
	}

	// Sample medical procedures
	procedures := []procedure.Procedure{
		{
			Code:        "PROC-001",
			Name:        "Suntik Intramuskular",
			NameEn:      stringPtr("Intramuscular Injection"),
			Category:    stringPtr("Injection"),
			Description: stringPtr("Pemberian obat melalui suntikan intramuskular"),
			Price:       int64Ptr(50000),
			Status:      "active",
		},
		{
			Code:        "PROC-002",
			Name:        "Suntik Intravena",
			NameEn:      stringPtr("Intravenous Injection"),
			Category:    stringPtr("Injection"),
			Description: stringPtr("Pemberian obat melalui suntikan intravena"),
			Price:       int64Ptr(75000),
			Status:      "active",
		},
		{
			Code:        "PROC-003",
			Name:        "Suntik Subkutan",
			NameEn:      stringPtr("Subcutaneous Injection"),
			Category:    stringPtr("Injection"),
			Description: stringPtr("Pemberian obat melalui suntikan subkutan"),
			Price:       int64Ptr(45000),
			Status:      "active",
		},
		{
			Code:        "PROC-004",
			Name:        "Pemasangan Infus",
			NameEn:      stringPtr("IV Drip Installation"),
			Category:    stringPtr("Infusion"),
			Description: stringPtr("Pemasangan infus untuk pemberian cairan atau obat"),
			Price:       int64Ptr(100000),
			Status:      "active",
		},
		{
			Code:        "PROC-005",
			Name:        "Pemasangan Kateter Urin",
			NameEn:      stringPtr("Urinary Catheterization"),
			Category:    stringPtr("Catheterization"),
			Description: stringPtr("Pemasangan kateter untuk drainase urin"),
			Price:       int64Ptr(150000),
			Status:      "active",
		},
		{
			Code:        "PROC-006",
			Name:        "Pemeriksaan Tekanan Darah",
			NameEn:      stringPtr("Blood Pressure Measurement"),
			Category:    stringPtr("Examination"),
			Description: stringPtr("Pengukuran tekanan darah"),
			Price:       int64Ptr(25000),
			Status:      "active",
		},
		{
			Code:        "PROC-007",
			Name:        "Pemeriksaan Suhu Badan",
			NameEn:      stringPtr("Body Temperature Measurement"),
			Category:    stringPtr("Examination"),
			Description: stringPtr("Pengukuran suhu tubuh"),
			Price:       int64Ptr(15000),
			Status:      "active",
		},
		{
			Code:        "PROC-008",
			Name:        "Pemeriksaan Nadi",
			NameEn:      stringPtr("Pulse Rate Measurement"),
			Category:    stringPtr("Examination"),
			Description: stringPtr("Pengukuran denyut nadi"),
			Price:       int64Ptr(20000),
			Status:      "active",
		},
		{
			Code:        "PROC-009",
			Name:        "Pemeriksaan Pernapasan",
			NameEn:      stringPtr("Respiratory Rate Measurement"),
			Category:    stringPtr("Examination"),
			Description: stringPtr("Pengukuran frekuensi pernapasan"),
			Price:       int64Ptr(20000),
			Status:      "active",
		},
		{
			Code:        "PROC-010",
			Name:        "Pemasangan Oksigen",
			NameEn:      stringPtr("Oxygen Administration"),
			Category:    stringPtr("Respiratory"),
			Description: stringPtr("Pemberian oksigen melalui nasal kanula atau masker"),
			Price:       int64Ptr(75000),
			Status:      "active",
		},
		{
			Code:        "PROC-011",
			Name:        "Nebulizer",
			NameEn:      stringPtr("Nebulization"),
			Category:    stringPtr("Respiratory"),
			Description: stringPtr("Terapi nebulisasi untuk gangguan pernapasan"),
			Price:       int64Ptr(100000),
			Status:      "active",
		},
		{
			Code:        "PROC-012",
			Name:        "Pemasangan EKG",
			NameEn:      stringPtr("ECG Installation"),
			Category:    stringPtr("Cardiac"),
			Description: stringPtr("Pemeriksaan elektrokardiogram"),
			Price:       int64Ptr(200000),
			Status:      "active",
		},
		{
			Code:        "PROC-013",
			Name:        "Pemasangan SpO2 Monitor",
			NameEn:      stringPtr("SpO2 Monitoring"),
			Category:    stringPtr("Monitoring"),
			Description: stringPtr("Pemantauan saturasi oksigen"),
			Price:       int64Ptr(50000),
			Status:      "active",
		},
		{
			Code:        "PROC-014",
			Name:        "Pemasangan Monitor Tanda Vital",
			NameEn:      stringPtr("Vital Signs Monitoring"),
			Category:    stringPtr("Monitoring"),
			Description: stringPtr("Pemantauan tanda-tanda vital"),
			Price:       int64Ptr(100000),
			Status:      "active",
		},
		{
			Code:        "PROC-015",
			Name:        "Pemasangan Perban",
			NameEn:      stringPtr("Bandaging"),
			Category:    stringPtr("Wound Care"),
			Description: stringPtr("Pemasangan perban pada luka"),
			Price:       int64Ptr(30000),
			Status:      "active",
		},
		{
			Code:        "PROC-016",
			Name:        "Perawatan Luka",
			NameEn:      stringPtr("Wound Care"),
			Category:    stringPtr("Wound Care"),
			Description: stringPtr("Perawatan dan pembersihan luka"),
			Price:       int64Ptr(75000),
			Status:      "active",
		},
		{
			Code:        "PROC-017",
			Name:        "Jahit Luka",
			NameEn:      stringPtr("Suturing"),
			Category:    stringPtr("Wound Care"),
			Description: stringPtr("Penjahitan luka"),
			Price:       int64Ptr(250000),
			Status:      "active",
		},
		{
			Code:        "PROC-018",
			Name:        "Pemasangan Gips",
			NameEn:      stringPtr("Cast Application"),
			Category:    stringPtr("Orthopedic"),
			Description: stringPtr("Pemasangan gips untuk patah tulang"),
			Price:       int64Ptr(500000),
			Status:      "active",
		},
		{
			Code:        "PROC-019",
			Name:        "Pemasangan Splint",
			NameEn:      stringPtr("Splinting"),
			Category:    stringPtr("Orthopedic"),
			Description: stringPtr("Pemasangan bidai"),
			Price:       int64Ptr(200000),
			Status:      "active",
		},
		{
			Code:        "PROC-020",
			Name:        "Konsultasi Dokter",
			NameEn:      stringPtr("Doctor Consultation"),
			Category:    stringPtr("Consultation"),
			Description: stringPtr("Konsultasi dengan dokter"),
			Price:       int64Ptr(150000),
			Status:      "active",
		},
	}

	// Create procedures
	for _, p := range procedures {
		if err := database.DB.Create(&p).Error; err != nil {
			return err
		}
		log.Printf("Created procedure: %s - %s", p.Code, p.Name)
	}

	log.Printf("Created %d procedures", len(procedures))
	log.Println("Procedures seeded successfully")
	return nil
}

