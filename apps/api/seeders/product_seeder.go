package seeders

import (
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/product"
)

// SeedProducts seeds sample products for Sales CRM.
func SeedProducts() error {
	db := database.DB

	// Get some categories to attach products to.
	var categories []product.ProductCategory
	if err := db.Limit(3).Find(&categories).Error; err != nil {
		return err
	}

	if len(categories) == 0 {
		// No categories, nothing to seed.
		return nil
	}

	now := time.Now()

	samples := []product.Product{
		{
			Name:        "Amoxicillin 500mg Capsule",
			SKU:         "AMOX-500-CAP",
			Barcode:     "8991234567001",
			Price:       750000, // Rp 7.500,00 (x100 sen)
			Cost:        500000, // Rp 5.000,00
			Stock:       500,
			CategoryID:  categories[0].ID,
			Status:      "active",
			Taxable:     true,
			Description: "Antibiotik spektrum luas untuk infeksi bakteri.",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			Name:        "Paracetamol 500mg Tablet",
			SKU:         "PARA-500-TAB",
			Barcode:     "8991234567002",
			Price:       300000, // Rp 3.000,00
			Cost:        150000, // Rp 1.500,00
			Stock:       1000,
			CategoryID:  categories[1%len(categories)].ID,
			Status:      "active",
			Taxable:     true,
			Description: "Analgetik dan antipiretik untuk menurunkan demam dan nyeri.",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			Name:        "Blood Pressure Monitor",
			SKU:         "BP-MON-001",
			Barcode:     "8991234567003",
			Price:       35000000, // Rp 350.000,00
			Cost:        25000000, // Rp 250.000,00
			Stock:       50,
			CategoryID:  categories[2%len(categories)].ID,
			Status:      "active",
			Taxable:     true,
			Description: "Alat pengukur tekanan darah digital untuk klinik dan rumah sakit.",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}

	for _, p := range samples {
		var existing product.Product
		if err := db.Where("sku = ?", p.SKU).First(&existing).Error; err == nil {
			continue
		}

		if err := db.Create(&p).Error; err != nil {
			return err
		}
	}

	return nil
}


