package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/category"
)

// SeedCategories seeds initial category data for diagnosis and procedure
func SeedCategories() error {
	// Check if categories already exist
	var count int64
	database.DB.Model(&category.Category{}).Count(&count)
	if count > 0 {
		log.Println("Categories already seeded, skipping...")
		return nil
	}

	// Sample categories for diagnosis
	diagnosisCategories := []category.Category{
		{
			Type:        category.CategoryTypeDiagnosis,
			Name:        "Penyakit Menular",
			Description: stringPtr("Kategori untuk penyakit menular"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeDiagnosis,
			Name:        "Penyakit Endokrin",
			Description: stringPtr("Kategori untuk penyakit endokrin"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeDiagnosis,
			Name:        "Penyakit Kardiovaskular",
			Description: stringPtr("Kategori untuk penyakit kardiovaskular"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeDiagnosis,
			Name:        "Penyakit Pernapasan",
			Description: stringPtr("Kategori untuk penyakit pernapasan"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeDiagnosis,
			Name:        "Penyakit Pencernaan",
			Description: stringPtr("Kategori untuk penyakit pencernaan"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeDiagnosis,
			Name:        "Penyakit Otot dan Jaringan Ikat",
			Description: stringPtr("Kategori untuk penyakit otot dan jaringan ikat"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeDiagnosis,
			Name:        "Penyakit Saluran Kemih",
			Description: stringPtr("Kategori untuk penyakit saluran kemih"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeDiagnosis,
			Name:        "Gejala dan Tanda",
			Description: stringPtr("Kategori untuk gejala dan tanda"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeDiagnosis,
			Name:        "Kontak dengan Pelayanan Kesehatan",
			Description: stringPtr("Kategori untuk kontak dengan pelayanan kesehatan"),
			Status:      "active",
		},
	}

	// Sample categories for procedure
	procedureCategories := []category.Category{
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Injection",
			Description: stringPtr("Kategori untuk prosedur suntikan"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Infusion",
			Description: stringPtr("Kategori untuk prosedur infus"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Catheterization",
			Description: stringPtr("Kategori untuk prosedur kateterisasi"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Examination",
			Description: stringPtr("Kategori untuk prosedur pemeriksaan"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Respiratory",
			Description: stringPtr("Kategori untuk prosedur pernapasan"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Cardiac",
			Description: stringPtr("Kategori untuk prosedur jantung"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Monitoring",
			Description: stringPtr("Kategori untuk prosedur monitoring"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Wound Care",
			Description: stringPtr("Kategori untuk prosedur perawatan luka"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Orthopedic",
			Description: stringPtr("Kategori untuk prosedur orthopedi"),
			Status:      "active",
		},
		{
			Type:        category.CategoryTypeProcedure,
			Name:        "Consultation",
			Description: stringPtr("Kategori untuk konsultasi"),
			Status:      "active",
		},
	}

	// Create diagnosis categories
	for _, c := range diagnosisCategories {
		if err := database.DB.Create(&c).Error; err != nil {
			return err
		}
		log.Printf("Created diagnosis category: %s", c.Name)
	}

	// Create procedure categories
	for _, c := range procedureCategories {
		if err := database.DB.Create(&c).Error; err != nil {
			return err
		}
		log.Printf("Created procedure category: %s", c.Name)
	}

	log.Printf("Created %d diagnosis categories and %d procedure categories", len(diagnosisCategories), len(procedureCategories))
	log.Println("Categories seeded successfully")
	return nil
}

