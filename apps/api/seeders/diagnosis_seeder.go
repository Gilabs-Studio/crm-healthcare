package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
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

	// Sample ICD-10 diagnoses
	diagnoses := []diagnosis.Diagnosis{
		{
			Code:        "A00.0",
			Name:        "Kolera karena Vibrio cholerae 01, biovar cholerae",
			NameEn:      stringPtr("Cholera due to Vibrio cholerae 01, biovar cholerae"),
			Category:    stringPtr("Penyakit Menular"),
			Description: stringPtr("Kolera klasik"),
			Status:      "active",
		},
		{
			Code:        "A00.1",
			Name:        "Kolera karena Vibrio cholerae 01, biovar eltor",
			NameEn:      stringPtr("Cholera due to Vibrio cholerae 01, biovar eltor"),
			Category:    stringPtr("Penyakit Menular"),
			Description: stringPtr("Kolera El Tor"),
			Status:      "active",
		},
		{
			Code:        "A01.0",
			Name:        "Demam tifoid",
			NameEn:      stringPtr("Typhoid fever"),
			Category:    stringPtr("Penyakit Menular"),
			Description: stringPtr("Infeksi Salmonella typhi"),
			Status:      "active",
		},
		{
			Code:        "A02.0",
			Name:        "Infeksi salmonella enteritis",
			NameEn:      stringPtr("Salmonella enteritis"),
			Category:    stringPtr("Penyakit Menular"),
			Description: stringPtr("Salmonellosis"),
			Status:      "active",
		},
		{
			Code:        "A09.0",
			Name:        "Gastroenteritis dan kolitis yang berasal dari infeksi dan tidak diketahui",
			NameEn:      stringPtr("Gastroenteritis and colitis of infectious origin, unspecified"),
			Category:    stringPtr("Penyakit Menular"),
			Description: stringPtr("Diare infeksius"),
			Status:      "active",
		},
		{
			Code:        "E10.9",
			Name:        "Diabetes melitus tipe 1 tanpa komplikasi",
			NameEn:      stringPtr("Type 1 diabetes mellitus without complications"),
			Category:    stringPtr("Penyakit Endokrin"),
			Description: stringPtr("DM Tipe 1"),
			Status:      "active",
		},
		{
			Code:        "E11.9",
			Name:        "Diabetes melitus tipe 2 tanpa komplikasi",
			NameEn:      stringPtr("Type 2 diabetes mellitus without complications"),
			Category:    stringPtr("Penyakit Endokrin"),
			Description: stringPtr("DM Tipe 2"),
			Status:      "active",
		},
		{
			Code:        "I10",
			Name:        "Hipertensi esensial (primer)",
			NameEn:      stringPtr("Essential (primary) hypertension"),
			Category:    stringPtr("Penyakit Kardiovaskular"),
			Description: stringPtr("Hipertensi"),
			Status:      "active",
		},
		{
			Code:        "I20.9",
			Name:        "Angina pektoris, tidak spesifik",
			NameEn:      stringPtr("Angina pectoris, unspecified"),
			Category:    stringPtr("Penyakit Kardiovaskular"),
			Description: stringPtr("Angina"),
			Status:      "active",
		},
		{
			Code:        "J00",
			Name:        "Rinitis akut (common cold)",
			NameEn:      stringPtr("Acute nasopharyngitis (common cold)"),
			Category:    stringPtr("Penyakit Pernapasan"),
			Description: stringPtr("Pilek"),
			Status:      "active",
		},
		{
			Code:        "J06.9",
			Name:        "Infeksi saluran pernapasan akut, tidak spesifik",
			NameEn:      stringPtr("Acute upper respiratory infection, unspecified"),
			Category:    stringPtr("Penyakit Pernapasan"),
			Description: stringPtr("ISPA"),
			Status:      "active",
		},
		{
			Code:        "J18.9",
			Name:        "Pneumonia, tidak diketahui penyebabnya",
			NameEn:      stringPtr("Pneumonia, unspecified organism"),
			Category:    stringPtr("Penyakit Pernapasan"),
			Description: stringPtr("Pneumonia"),
			Status:      "active",
		},
		{
			Code:        "K25.9",
			Name:        "Ulkus peptikum, tidak spesifik sebagai akut atau kronik, tanpa perdarahan atau perforasi",
			NameEn:      stringPtr("Gastric ulcer, unspecified as acute or chronic, without hemorrhage or perforation"),
			Category:    stringPtr("Penyakit Pencernaan"),
			Description: stringPtr("Tukak lambung"),
			Status:      "active",
		},
		{
			Code:        "K29.9",
			Name:        "Gastritis, tidak spesifik",
			NameEn:      stringPtr("Gastritis, unspecified"),
			Category:    stringPtr("Penyakit Pencernaan"),
			Description: stringPtr("Gastritis"),
			Status:      "active",
		},
		{
			Code:        "M79.3",
			Name:        "Panniculitis, tidak spesifik",
			NameEn:      stringPtr("Panniculitis, unspecified"),
			Category:    stringPtr("Penyakit Otot dan Jaringan Ikat"),
			Description: stringPtr("Nyeri otot"),
			Status:      "active",
		},
		{
			Code:        "N39.0",
			Name:        "Infeksi saluran kemih, lokasi tidak spesifik",
			NameEn:      stringPtr("Urinary tract infection, site not specified"),
			Category:    stringPtr("Penyakit Saluran Kemih"),
			Description: stringPtr("ISK"),
			Status:      "active",
		},
		{
			Code:        "R50.9",
			Name:        "Demam, tidak spesifik",
			NameEn:      stringPtr("Fever, unspecified"),
			Category:    stringPtr("Gejala dan Tanda"),
			Description: stringPtr("Demam"),
			Status:      "active",
		},
		{
			Code:        "R51",
			Name:        "Sakit kepala",
			NameEn:      stringPtr("Headache"),
			Category:    stringPtr("Gejala dan Tanda"),
			Description: stringPtr("Sakit kepala"),
			Status:      "active",
		},
		{
			Code:        "Z00.0",
			Name:        "Pemeriksaan kesehatan umum",
			NameEn:      stringPtr("General health check-up"),
			Category:    stringPtr("Kontak dengan Pelayanan Kesehatan"),
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

