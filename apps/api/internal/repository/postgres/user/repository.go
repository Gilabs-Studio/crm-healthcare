package user

import (
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new user repository
func NewRepository(db *gorm.DB) interfaces.UserRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*user.User, error) {
	var u user.User
	err := r.db.
		Preload("UserRoles.Role").
		Preload("Permissions").
		Where("id = ?", id).
		First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *repository) FindByEmail(email string) (*user.User, error) {
	var u user.User
	err := r.db.
		Preload("UserRoles.Role").
		Preload("Permissions").
		Where("email = ?", email).
		First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *repository) List(req *user.ListUsersRequest) ([]user.User, int64, error) {
	var users []user.User
	var total int64
	
	query := r.db.Model(&user.User{})
	
	// Apply filters
	if req.Search != "" {
		search := "%" + req.Search + "%"
		query = query.Where("name ILIKE ? OR email ILIKE ?", search, search)
	}
	
	if req.Role != "" {
		query = query.Where("role = ?", req.Role)
	}
	
	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}
	
	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	
	// Apply sorting
	sortBy := req.SortBy
	if sortBy == "" {
		sortBy = "created_at"
	}
	sortOrder := req.SortOrder
	if sortOrder == "" {
		sortOrder = "desc"
	}
	query = query.Order(sortBy + " " + strings.ToUpper(sortOrder))
	
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
	
	// Execute query with relationships
	err := query.
		Preload("UserRoles.Role").
		Preload("Permissions").
		Limit(perPage).
		Offset(offset).
		Find(&users).Error
	
	return users, total, err
}

func (r *repository) Create(u *user.User) error {
	return r.db.Create(u).Error
}

func (r *repository) Update(u *user.User) error {
	return r.db.Save(u).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Delete(&user.User{}, "id = ?", id).Error
}

func (r *repository) AssignRoles(userID string, roleIDs []string) error {
	if len(roleIDs) == 0 {
		return nil
	}
	
	// Remove existing roles
	if err := r.db.Where("user_id = ?", userID).Delete(&user.UserRole{}).Error; err != nil {
		return err
	}
	
	// Add new roles
	userRoles := make([]user.UserRole, len(roleIDs))
	for i, roleID := range roleIDs {
		userRoles[i] = user.UserRole{
			UserID: userID,
			RoleID: roleID,
		}
	}
	
	return r.db.Create(&userRoles).Error
}

func (r *repository) RemoveRoles(userID string, roleIDs []string) error {
	if len(roleIDs) == 0 {
		return nil
	}
	return r.db.Where("user_id = ? AND role_id IN ?", userID, roleIDs).Delete(&user.UserRole{}).Error
}

func (r *repository) AssignPermissions(userID string, permissionIDs []string) error {
	if len(permissionIDs) == 0 {
		return nil
	}
	
	var permissions []user.Permission
	if err := r.db.Where("id IN ?", permissionIDs).Find(&permissions).Error; err != nil {
		return err
	}
	
	var u user.User
	if err := r.db.First(&u, "id = ?", userID).Error; err != nil {
		return err
	}
	
	return r.db.Model(&u).Association("Permissions").Replace(permissions)
}

func (r *repository) RemovePermissions(userID string, permissionIDs []string) error {
	if len(permissionIDs) == 0 {
		return nil
	}
	
	var u user.User
	if err := r.db.First(&u, "id = ?", userID).Error; err != nil {
		return err
	}
	
	var permissions []user.Permission
	if err := r.db.Where("id IN ?", permissionIDs).Find(&permissions).Error; err != nil {
		return err
	}
	
	return r.db.Model(&u).Association("Permissions").Delete(permissions)
}

func (r *repository) GetUserPermissions(userID string) ([]user.Permission, error) {
	var permissions []user.Permission
	
	// Get permissions from roles
	err := r.db.
		Table("permissions").
		Joins("INNER JOIN role_permissions ON role_permissions.permission_id = permissions.id").
		Joins("INNER JOIN user_roles ON user_roles.role_id = role_permissions.role_id").
		Where("user_roles.user_id = ?", userID).
		Find(&permissions).Error
	
	if err != nil {
		return nil, err
	}
	
	// Get direct permissions
	var directPermissions []user.Permission
	err = r.db.
		Table("permissions").
		Joins("INNER JOIN user_permissions ON user_permissions.permission_id = permissions.id").
		Where("user_permissions.user_id = ?", userID).
		Find(&directPermissions).Error
	
	if err != nil {
		return nil, err
	}
	
	// Combine and deduplicate
	permissionMap := make(map[string]user.Permission)
	for _, p := range permissions {
		permissionMap[p.ID] = p
	}
	for _, p := range directPermissions {
		permissionMap[p.ID] = p
	}
	
	result := make([]user.Permission, 0, len(permissionMap))
	for _, p := range permissionMap {
		result = append(result, p)
	}
	
	return result, nil
}

// Role repository methods

func (r *repository) FindRoleByID(id string) (*user.Role, error) {
	var role user.Role
	err := r.db.Where("id = ?", id).First(&role).Error
	return &role, err
}

func (r *repository) FindRoleByName(name string) (*user.Role, error) {
	var role user.Role
	err := r.db.Where("name = ?", name).First(&role).Error
	return &role, err
}

func (r *repository) ListRoles() ([]user.Role, error) {
	var roles []user.Role
	err := r.db.Where("status = ?", "active").Find(&roles).Error
	return roles, err
}

func (r *repository) CreateRole(role *user.Role) error {
	return r.db.Create(role).Error
}

func (r *repository) UpdateRole(role *user.Role) error {
	return r.db.Save(role).Error
}

// Permission repository methods

func (r *repository) FindPermissionByID(id string) (*user.Permission, error) {
	var permission user.Permission
	err := r.db.Where("id = ?", id).First(&permission).Error
	return &permission, err
}

func (r *repository) FindPermissionByCode(code string) (*user.Permission, error) {
	var permission user.Permission
	err := r.db.Where("code = ?", code).First(&permission).Error
	return &permission, err
}

func (r *repository) ListPermissions() ([]user.Permission, error) {
	var permissions []user.Permission
	err := r.db.Where("status = ?", "active").Find(&permissions).Error
	return permissions, err
}

func (r *repository) CreatePermission(permission *user.Permission) error {
	return r.db.Create(permission).Error
}

func (r *repository) UpdatePermission(permission *user.Permission) error {
	return r.db.Save(permission).Error
}

