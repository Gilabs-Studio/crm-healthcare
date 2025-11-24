package account

import (
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new account repository
func NewRepository(db *gorm.DB) interfaces.AccountRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*account.Account, error) {
	var a account.Account
	err := r.db.Where("id = ?", id).First(&a).Error
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *repository) List(req *account.ListAccountsRequest) ([]account.Account, int64, error) {
	var accounts []account.Account
	var total int64

	query := r.db.Model(&account.Account{})

	// Apply filters
	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where(
			"LOWER(name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(province) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ?",
			search, search, search, search, search,
		)
	}

	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}

	if req.Category != "" {
		query = query.Where("category = ?", req.Category)
	}

	if req.AssignedTo != "" {
		query = query.Where("assigned_to = ?", req.AssignedTo)
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
	err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&accounts).Error
	if err != nil {
		return nil, 0, err
	}

	return accounts, total, nil
}

func (r *repository) Create(a *account.Account) error {
	return r.db.Create(a).Error
}

func (r *repository) Update(a *account.Account) error {
	return r.db.Save(a).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&account.Account{}).Error
}

