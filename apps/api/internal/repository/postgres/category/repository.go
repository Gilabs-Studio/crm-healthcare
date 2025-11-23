package category

import (
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/category"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new category repository
func NewRepository(db *gorm.DB) interfaces.CategoryRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*category.Category, error) {
	var c category.Category
	err := r.db.Where("id = ?", id).First(&c).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *repository) List(req *category.ListCategoriesRequest) ([]category.Category, int64, error) {
	var categories []category.Category
	var total int64

	query := r.db.Model(&category.Category{})

	// Apply filters
	if req.Type != "" {
		query = query.Where("type = ?", req.Type)
	}

	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}

	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(COALESCE(description, '')) LIKE ?", search, search)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	page := req.Page
	if page < 1 {
		page = 1
	}
	perPage := req.PerPage
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	offset := (page - 1) * perPage

	// Fetch data
	err := query.Order("name ASC").Offset(offset).Limit(perPage).Find(&categories).Error
	if err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

func (r *repository) Create(c *category.Category) error {
	return r.db.Create(c).Error
}

func (r *repository) Update(c *category.Category) error {
	return r.db.Save(c).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Delete(&category.Category{}, "id = ?", id).Error
}

