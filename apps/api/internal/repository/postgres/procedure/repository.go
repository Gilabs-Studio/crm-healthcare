package procedure

import (
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/procedure"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new procedure repository
func NewRepository(db *gorm.DB) interfaces.ProcedureRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*procedure.Procedure, error) {
	var p procedure.Procedure
	err := r.db.Where("id = ?", id).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) FindByCode(code string) (*procedure.Procedure, error) {
	var p procedure.Procedure
	err := r.db.Where("code = ?", code).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) List(req *procedure.ListProceduresRequest) ([]procedure.Procedure, int64, error) {
	var procedures []procedure.Procedure
	var total int64

	query := r.db.Model(&procedure.Procedure{})

	// Apply filters
	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where(
			"LOWER(code) LIKE ? OR LOWER(name) LIKE ? OR LOWER(COALESCE(name_en, '')) LIKE ? OR LOWER(COALESCE(category, '')) LIKE ? OR LOWER(COALESCE(description, '')) LIKE ?",
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

	// Fetch data
	err := query.Order("code ASC").Offset(offset).Limit(perPage).Find(&procedures).Error
	if err != nil {
		return nil, 0, err
	}

	return procedures, total, nil
}

func (r *repository) Search(req *procedure.SearchProceduresRequest) ([]procedure.Procedure, error) {
	var procedures []procedure.Procedure

	query := r.db.Model(&procedure.Procedure{})

	// Apply search
	search := "%" + strings.ToLower(req.Query) + "%"
	query = query.Where(
		"LOWER(code) LIKE ? OR LOWER(name) LIKE ? OR LOWER(COALESCE(name_en, '')) LIKE ? OR LOWER(COALESCE(category, '')) LIKE ? OR LOWER(COALESCE(description, '')) LIKE ?",
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

	// Fetch data
	err := query.Order("code ASC").Limit(limit).Find(&procedures).Error
	if err != nil {
		return nil, err
	}

	return procedures, nil
}

func (r *repository) Create(p *procedure.Procedure) error {
	return r.db.Create(p).Error
}

func (r *repository) Update(p *procedure.Procedure) error {
	return r.db.Save(p).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Delete(&procedure.Procedure{}, "id = ?", id).Error
}

