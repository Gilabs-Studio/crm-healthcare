package product

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ProductCategory represents category for products (e.g. Drug, Medical Device, Supplement)
type ProductCategory struct {
	ID          string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string         `gorm:"type:varchar(150);not null;uniqueIndex" json:"name"`
	Slug        string         `gorm:"type:varchar(150);not null;uniqueIndex" json:"slug"`
	Description string         `gorm:"type:text" json:"description"`
	Status      string         `gorm:"type:varchar(20);not null;default:'active'" json:"status"` // active, inactive
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for ProductCategory.
func (ProductCategory) TableName() string {
	return "product_categories"
}

// BeforeCreate hook to generate UUID.
func (c *ProductCategory) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	if c.Slug == "" && c.Name != "" {
		c.Slug = generateSlug(c.Name)
	}
	return nil
}

// BeforeUpdate ensures slug stays in sync when name changes (if slug not provided explicitly).
func (c *ProductCategory) BeforeUpdate(tx *gorm.DB) error {
	if c.Slug == "" && c.Name != "" {
		c.Slug = generateSlug(c.Name)
	}
	return nil
}

// Product represents a product in the CRM system.
type Product struct {
	ID          string              `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string              `gorm:"type:varchar(200);not null" json:"name"`
	SKU         string              `gorm:"type:varchar(100);not null;uniqueIndex" json:"sku"`
	Barcode     string              `gorm:"type:varchar(100)" json:"barcode"`
	Price       int64               `gorm:"type:bigint;not null;default:0" json:"price"` // Stored in smallest currency unit (sen)
	Cost        int64               `gorm:"type:bigint;not null;default:0" json:"cost"`
	Stock       int                 `gorm:"type:integer;not null;default:0" json:"stock"`
	CategoryID  string              `gorm:"type:uuid;not null;index" json:"category_id"`
	Category    *ProductCategoryRef `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Status      string              `gorm:"type:varchar(20);not null;default:'active'" json:"status"` // active, inactive
	Taxable     bool                `gorm:"type:boolean;not null;default:true" json:"taxable"`
	Description string              `gorm:"type:text" json:"description"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	DeletedAt   gorm.DeletedAt      `gorm:"index" json:"-"`
}

// TableName specifies the table name for Product.
func (Product) TableName() string {
	return "products"
}

// BeforeCreate hook to generate UUID.
func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// ProductCategoryRef represents category reference in product.
type ProductCategoryRef struct {
	ID   string `gorm:"type:uuid;primary_key" json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

// TableName specifies the table name for ProductCategoryRef.
func (ProductCategoryRef) TableName() string {
	return "product_categories"
}

// ProductCategoryResponse represents category response DTO.
type ProductCategoryResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToProductCategoryResponse converts ProductCategory to ProductCategoryResponse.
func (c *ProductCategory) ToProductCategoryResponse() *ProductCategoryResponse {
	return &ProductCategoryResponse{
		ID:          c.ID,
		Name:        c.Name,
		Slug:        c.Slug,
		Description: c.Description,
		Status:      c.Status,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}

// ProductResponse represents product response DTO.
type ProductResponse struct {
	ID          string                   `json:"id"`
	Name        string                   `json:"name"`
	SKU         string                   `json:"sku"`
	Barcode     string                   `json:"barcode"`
	Price       int64                    `json:"price"`
	PriceFormatted string                `json:"price_formatted,omitempty"`
	Cost        int64                    `json:"cost"`
	Stock       int                      `json:"stock"`
	CategoryID  string                   `json:"category_id"`
	Category    *ProductCategoryResponse `json:"category,omitempty"`
	Status      string                   `json:"status"`
	Taxable     bool                     `json:"taxable"`
	Description string                   `json:"description"`
	CreatedAt   time.Time                `json:"created_at"`
	UpdatedAt   time.Time                `json:"updated_at"`
}

// ToProductResponse converts Product to ProductResponse.
func (p *Product) ToProductResponse() *ProductResponse {
	resp := &ProductResponse{
		ID:          p.ID,
		Name:        p.Name,
		SKU:         p.SKU,
		Barcode:     p.Barcode,
		Price:       p.Price,
		Cost:        p.Cost,
		Stock:       p.Stock,
		CategoryID:  p.CategoryID,
		Status:      p.Status,
		Taxable:     p.Taxable,
		Description: p.Description,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}

	// Populate category response if loaded.
	if p.Category != nil {
		resp.Category = &ProductCategoryResponse{
			ID:    p.Category.ID,
			Name:  p.Category.Name,
			Slug:  p.Category.Slug,
			// Description is not loaded in ref; keep empty to minimize join size.
			Description: "",
			Status:      "",
			CreatedAt:   time.Time{},
			UpdatedAt:   time.Time{},
		}
	}

	// Format price as currency (including 0).
	resp.PriceFormatted = formatCurrency(p.Price)

	return resp
}

// CreateProductRequest represents create product request DTO.
type CreateProductRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=200"`
	SKU         string `json:"sku" binding:"required,min=1,max=100"`
	Barcode     string `json:"barcode" binding:"omitempty,max=100"`
	Price       int64  `json:"price" binding:"required,min=0"`
	Cost        int64  `json:"cost" binding:"omitempty,min=0"`
	Stock       int    `json:"stock" binding:"omitempty,min=0"`
	CategoryID  string `json:"category_id" binding:"required,uuid"`
	Status      string `json:"status" binding:"omitempty,oneof=active inactive"`
	Taxable     *bool  `json:"taxable" binding:"omitempty"`
	Description string `json:"description" binding:"omitempty"`
}

// UpdateProductRequest represents update product request DTO.
type UpdateProductRequest struct {
	Name        string `json:"name" binding:"omitempty,min=3,max=200"`
	SKU         string `json:"sku" binding:"omitempty,min=1,max=100"`
	Barcode     string `json:"barcode" binding:"omitempty,max=100"`
	Price       *int64 `json:"price" binding:"omitempty,min=0"`
	Cost        *int64 `json:"cost" binding:"omitempty,min=0"`
	Stock       *int   `json:"stock" binding:"omitempty,min=0"`
	CategoryID  string `json:"category_id" binding:"omitempty,uuid"`
	Status      string `json:"status" binding:"omitempty,oneof=active inactive"`
	Taxable     *bool  `json:"taxable" binding:"omitempty"`
	Description string `json:"description" binding:"omitempty"`
}

// ListProductsRequest represents list products query parameters.
type ListProductsRequest struct {
	Page       int    `form:"page" binding:"omitempty,min=1"`
	PerPage    int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search     string `form:"search" binding:"omitempty"`
	Status     string `form:"status" binding:"omitempty,oneof=active inactive"`
	CategoryID string `form:"category_id" binding:"omitempty,uuid"`
}

// ListProductCategoriesRequest represents list product categories query parameters.
type ListProductCategoriesRequest struct {
	Status string `form:"status" binding:"omitempty,oneof=active inactive"`
}

// CreateProductCategoryRequest represents create product category request DTO.
type CreateProductCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=150"`
	Slug        string `json:"slug" binding:"omitempty,max=150"`
	Description string `json:"description" binding:"omitempty"`
	Status      string `json:"status" binding:"omitempty,oneof=active inactive"`
}

// UpdateProductCategoryRequest represents update product category request DTO.
type UpdateProductCategoryRequest struct {
	Name        string `json:"name" binding:"omitempty,min=3,max=150"`
	Slug        string `json:"slug" binding:"omitempty,max=150"`
	Description string `json:"description" binding:"omitempty"`
	Status      string `json:"status" binding:"omitempty,oneof=active inactive"`
}

// formatCurrency formats integer (sen) to formatted currency string.
func formatCurrency(amount int64) string {
	rupiah := float64(amount) / 100.0
	return "Rp " + formatNumber(rupiah)
}

// formatNumber formats number with thousand separator.
func formatNumber(n float64) string {
	value := int64(n)
	if value == 0 {
		return "0"
	}

	negative := false
	if value < 0 {
		negative = true
		value = -value
	}

	str := fmt.Sprintf("%d", value)
	length := len(str)

	var parts []string
	for i := length; i > 0; i -= 3 {
		start := i - 3
		if start < 0 {
			start = 0
		}
		parts = append([]string{str[start:i]}, parts...)
	}

	result := strings.Join(parts, ".")
	if negative {
		result = "-" + result
	}

	return result
}

// generateSlug creates a simple slug from name.
func generateSlug(name string) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	return slug
}


