package role

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/role"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new role repository
func NewRepository(db *gorm.DB) interfaces.RoleRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*role.Role, error) {
	var ro role.Role
	err := r.db.Preload("Permissions").Where("id = ?", id).First(&ro).Error
	if err != nil {
		return nil, err
	}
	return &ro, nil
}

func (r *repository) FindByCode(code string) (*role.Role, error) {
	var ro role.Role
	err := r.db.Preload("Permissions").Where("code = ?", code).First(&ro).Error
	if err != nil {
		return nil, err
	}
	return &ro, nil
}

func (r *repository) List() ([]role.Role, error) {
	var roles []role.Role
	err := r.db.Preload("Permissions").Find(&roles).Error
	if err != nil {
		return nil, err
	}
	return roles, nil
}

func (r *repository) Create(ro *role.Role) error {
	return r.db.Create(ro).Error
}

func (r *repository) Update(ro *role.Role) error {
	return r.db.Save(ro).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&role.Role{}).Error
}

func (r *repository) AssignPermissions(roleID string, permissionIDs []string) error {
	// First, clear existing permissions
	if err := r.db.Exec("DELETE FROM role_permissions WHERE role_id = ?", roleID).Error; err != nil {
		return err
	}

	// Then assign new permissions
	if len(permissionIDs) > 0 {
		for _, permID := range permissionIDs {
			if err := r.db.Exec(
				"INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
				roleID, permID,
			).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

func (r *repository) GetPermissions(roleID string) ([]string, error) {
	var permissionIDs []string
	err := r.db.Table("role_permissions").
		Where("role_id = ?", roleID).
		Pluck("permission_id", &permissionIDs).Error
	if err != nil {
		return nil, err
	}
	return permissionIDs, nil
}

