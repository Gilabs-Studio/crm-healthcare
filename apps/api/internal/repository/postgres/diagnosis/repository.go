package diagnosis

import (
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/diagnosis"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new diagnosis repository
func NewRepository(db *gorm.DB) interfaces.DiagnosisRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*diagnosis.Diagnosis, error) {
	var d diagnosis.Diagnosis
	err := r.db.Preload("Category").Where("id = ?", id).First(&d).Error
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *repository) FindByCode(code string) (*diagnosis.Diagnosis, error) {
	var d diagnosis.Diagnosis
	err := r.db.Where("code = ?", code).First(&d).Error
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *repository) List(req *diagnosis.ListDiagnosesRequest) ([]diagnosis.Diagnosis, int64, error) {
	var diagnoses []diagnosis.Diagnosis
	var total int64

	query := r.db.Model(&diagnosis.Diagnosis{})

	// Apply filters
	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Joins("LEFT JOIN categories ON diagnoses.category_id = categories.id").
			Where(
				"LOWER(diagnoses.code) LIKE ? OR LOWER(diagnoses.name) LIKE ? OR LOWER(COALESCE(diagnoses.name_en, '')) LIKE ? OR LOWER(COALESCE(categories.name, '')) LIKE ? OR LOWER(COALESCE(diagnoses.description, '')) LIKE ?",
				search, search, search, search, search,
			)
	}

	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
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

	// Fetch data with preload category
	err := query.Preload("Category").Order("diagnoses.code ASC").Offset(offset).Limit(perPage).Find(&diagnoses).Error
	if err != nil {
		return nil, 0, err
	}

	return diagnoses, total, nil
}

func (r *repository) Search(req *diagnosis.SearchDiagnosesRequest) ([]diagnosis.Diagnosis, error) {
	var diagnoses []diagnosis.Diagnosis

	query := r.db.Model(&diagnosis.Diagnosis{})

	// Apply search
	search := "%" + strings.ToLower(req.Query) + "%"
	query = query.Joins("LEFT JOIN categories ON diagnoses.category_id = categories.id").
		Where(
			"LOWER(diagnoses.code) LIKE ? OR LOWER(diagnoses.name) LIKE ? OR LOWER(COALESCE(diagnoses.name_en, '')) LIKE ? OR LOWER(COALESCE(categories.name, '')) LIKE ? OR LOWER(COALESCE(diagnoses.description, '')) LIKE ?",
			search, search, search, search, search,
		)

	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}

	// Apply limit
	limit := req.Limit
	if limit < 1 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	// Fetch data with preload category
	err := query.Preload("Category").Order("diagnoses.code ASC").Limit(limit).Find(&diagnoses).Error
	if err != nil {
		return nil, err
	}

	return diagnoses, nil
}

func (r *repository) Create(d *diagnosis.Diagnosis) error {
	return r.db.Create(d).Error
}

func (r *repository) Update(d *diagnosis.Diagnosis) error {
	return r.db.Save(d).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Delete(&diagnosis.Diagnosis{}, "id = ?", id).Error
}

