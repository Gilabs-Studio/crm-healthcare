package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/category"
	"github.com/gilabs/crm-healthcare/api/internal/domain/diagnosis"
)

// SeedDiagnoses seeds initial diagnosis data (ICD-10)
func SeedDiagnoses() error {
	// Check if diagnoses already exist
	var count int64
	database.DB.Model(&diagnosis.Diagnosis{}).Count(&count)
	if count > 0 {
		log.Println("Diagnoses already seeded, skipping...")
		return nil
	}

	// Get categories from database
	var categories []category.Category
	if err := database.DB.Where("type = ? AND status = ?", category.CategoryTypeDiagnosis, "active").Find(&categories).Error; err != nil {
		return err
	}

	// Create category map for quick lookup by name -> ID
	categoryMap := make(map[string]*string)
	for _, c := range categories {
		categoryMap[c.Name] = &c.ID
	}

	// Helper function to get category ID
	getCategoryID := func(name string) *string {
		if catID, ok := categoryMap[name]; ok {
			return catID
		}
		return nil
	}

	// Sample ICD-10 diagnoses
	diagnoses := []diagnosis.Diagnosis{
		{
			Code:        "A00.0",
			Name:        "Kolera karena Vibrio cholerae 01, biovar cholerae",
			NameEn:      stringPtr("Cholera due to Vibrio cholerae 01, biovar cholerae"),
			CategoryID:  getCategoryID("Penyakit Menular"),
			Description: stringPtr("Kolera klasik"),
			Status:      "active",
		},
		{
			Code:        "A00.1",
			Name:        "Kolera karena Vibrio cholerae 01, biovar eltor",
			NameEn:      stringPtr("Cholera due to Vibrio cholerae 01, biovar eltor"),
			CategoryID:  getCategoryID("Penyakit Menular"),
			Description: stringPtr("Kolera El Tor"),
			Status:      "active",
		},
		{
			Code:        "A01.0",
			Name:        "Demam tifoid",
			NameEn:      stringPtr("Typhoid fever"),
			CategoryID:  getCategoryID("Penyakit Menular"),
			Description: stringPtr("Infeksi Salmonella typhi"),
			Status:      "active",
		},
		{
			Code:        "A02.0",
			Name:        "Infeksi salmonella enteritis",
			NameEn:      stringPtr("Salmonella enteritis"),
			CategoryID:  getCategoryID("Penyakit Menular"),
			Description: stringPtr("Salmonellosis"),
			Status:      "active",
		},
		{
			Code:        "A09.0",
			Name:        "Gastroenteritis dan kolitis yang berasal dari infeksi dan tidak diketahui",
			NameEn:      stringPtr("Gastroenteritis and colitis of infectious origin, unspecified"),
			CategoryID:  getCategoryID("Penyakit Menular"),
			Description: stringPtr("Diare infeksius"),
			Status:      "active",
		},
		{
			Code:        "E10.9",
			Name:        "Diabetes melitus tipe 1 tanpa komplikasi",
			NameEn:      stringPtr("Type 1 diabetes mellitus without complications"),
			CategoryID:  getCategoryID("Penyakit Endokrin"),
			Description: stringPtr("DM Tipe 1"),
			Status:      "active",
		},
		{
			Code:        "E11.9",
			Name:        "Diabetes melitus tipe 2 tanpa komplikasi",
			NameEn:      stringPtr("Type 2 diabetes mellitus without complications"),
			CategoryID:  getCategoryID("Penyakit Endokrin"),
			Description: stringPtr("DM Tipe 2"),
			Status:      "active",
		},
		{
			Code:        "I10",
			Name:        "Hipertensi esensial (primer)",
			NameEn:      stringPtr("Essential (primary) hypertension"),
			CategoryID:  getCategoryID("Penyakit Kardiovaskular"),
			Description: stringPtr("Hipertensi"),
			Status:      "active",
		},
		{
			Code:        "I20.9",
			Name:        "Angina pektoris, tidak spesifik",
			NameEn:      stringPtr("Angina pectoris, unspecified"),
			CategoryID:  getCategoryID("Penyakit Kardiovaskular"),
			Description: stringPtr("Angina"),
			Status:      "active",
		},
		{
			Code:        "J00",
			Name:        "Rinitis akut (common cold)",
			NameEn:      stringPtr("Acute nasopharyngitis (common cold)"),
			CategoryID:  getCategoryID("Penyakit Pernapasan"),
			Description: stringPtr("Pilek"),
			Status:      "active",
		},
		{
			Code:        "J06.9",
			Name:        "Infeksi saluran pernapasan akut, tidak spesifik",
			NameEn:      stringPtr("Acute upper respiratory infection, unspecified"),
			CategoryID:  getCategoryID("Penyakit Pernapasan"),
			Description: stringPtr("ISPA"),
			Status:      "active",
		},
		{
			Code:        "J18.9",
			Name:        "Pneumonia, tidak diketahui penyebabnya",
			NameEn:      stringPtr("Pneumonia, unspecified organism"),
			CategoryID:  getCategoryID("Penyakit Pernapasan"),
			Description: stringPtr("Pneumonia"),
			Status:      "active",
		},
		{
			Code:        "K25.9",
			Name:        "Ulkus peptikum, tidak spesifik sebagai akut atau kronik, tanpa perdarahan atau perforasi",
			NameEn:      stringPtr("Gastric ulcer, unspecified as acute or chronic, without hemorrhage or perforation"),
			CategoryID:  getCategoryID("Penyakit Pencernaan"),
			Description: stringPtr("Tukak lambung"),
			Status:      "active",
		},
		{
			Code:        "K29.9",
			Name:        "Gastritis, tidak spesifik",
			NameEn:      stringPtr("Gastritis, unspecified"),
			CategoryID:  getCategoryID("Penyakit Pencernaan"),
			Description: stringPtr("Gastritis"),
			Status:      "active",
		},
		{
			Code:        "M79.3",
			Name:        "Panniculitis, tidak spesifik",
			NameEn:      stringPtr("Panniculitis, unspecified"),
			CategoryID:  getCategoryID("Penyakit Otot dan Jaringan Ikat"),
			Description: stringPtr("Nyeri otot"),
			Status:      "active",
		},
		{
			Code:        "N39.0",
			Name:        "Infeksi saluran kemih, lokasi tidak spesifik",
			NameEn:      stringPtr("Urinary tract infection, site not specified"),
			CategoryID:  getCategoryID("Penyakit Saluran Kemih"),
			Description: stringPtr("ISK"),
			Status:      "active",
		},
		{
			Code:        "R50.9",
			Name:        "Demam, tidak spesifik",
			NameEn:      stringPtr("Fever, unspecified"),
			CategoryID:  getCategoryID("Gejala dan Tanda"),
			Description: stringPtr("Demam"),
			Status:      "active",
		},
		{
			Code:        "R51",
			Name:        "Sakit kepala",
			NameEn:      stringPtr("Headache"),
			CategoryID:  getCategoryID("Gejala dan Tanda"),
			Description: stringPtr("Sakit kepala"),
			Status:      "active",
		},
		{
			Code:        "Z00.0",
			Name:        "Pemeriksaan kesehatan umum",
			NameEn:      stringPtr("General health check-up"),
			CategoryID:  getCategoryID("Kontak dengan Pelayanan Kesehatan"),
			Description: stringPtr("Medical check-up"),
			Status:      "active",
		},
	}

	// Create diagnoses
	for _, d := range diagnoses {
		if err := database.DB.Create(&d).Error; err != nil {
			return err
		}
		log.Printf("Created diagnosis: %s - %s", d.Code, d.Name)
	}

	log.Printf("Created %d diagnoses", len(diagnoses))
	log.Println("Diagnoses seeded successfully")
	return nil
}

