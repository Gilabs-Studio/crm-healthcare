package contact_role

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/contact_role"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new contact role repository
func NewRepository(db *gorm.DB) interfaces.ContactRoleRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*contact_role.ContactRole, error) {
	var cr contact_role.ContactRole
	err := r.db.Where("id = ?", id).First(&cr).Error
	if err != nil {
		return nil, err
	}
	return &cr, nil
}

func (r *repository) FindByCode(code string) (*contact_role.ContactRole, error) {
	var cr contact_role.ContactRole
	err := r.db.Where("code = ?", code).First(&cr).Error
	if err != nil {
		return nil, err
	}
	return &cr, nil
}

func (r *repository) List() ([]contact_role.ContactRole, error) {
	var contactRoles []contact_role.ContactRole
	err := r.db.Find(&contactRoles).Error
	if err != nil {
		return nil, err
	}
	return contactRoles, nil
}

func (r *repository) Create(cr *contact_role.ContactRole) error {
	return r.db.Create(cr).Error
}

func (r *repository) Update(cr *contact_role.ContactRole) error {
	return r.db.Save(cr).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&contact_role.ContactRole{}).Error
}

