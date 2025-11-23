package permission

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/permission"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new permission repository
func NewRepository(db *gorm.DB) interfaces.PermissionRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*permission.Permission, error) {
	var p permission.Permission
	err := r.db.Preload("Menu").Where("id = ?", id).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) FindByCode(code string) (*permission.Permission, error) {
	var p permission.Permission
	err := r.db.Preload("Menu").Where("code = ?", code).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) List() ([]permission.Permission, error) {
	var permissions []permission.Permission
	err := r.db.Preload("Menu").Find(&permissions).Error
	if err != nil {
		return nil, err
	}
	return permissions, nil
}

func (r *repository) GetByMenuID(menuID string) ([]permission.Permission, error) {
	var permissions []permission.Permission
	err := r.db.Where("menu_id = ?", menuID).Find(&permissions).Error
	if err != nil {
		return nil, err
	}
	return permissions, nil
}

func (r *repository) GetByRoleID(roleID string) ([]permission.Permission, error) {
	var permissions []permission.Permission
	err := r.db.Table("permissions").
		Joins("INNER JOIN role_permissions ON permissions.id = role_permissions.permission_id").
		Where("role_permissions.role_id = ?", roleID).
		Find(&permissions).Error
	if err != nil {
		return nil, err
	}
	return permissions, nil
}

func (r *repository) GetUserPermissions(userID string) (*permission.GetUserPermissionsResponse, error) {
	// Get user's role
	var roleID string
	var roleCode string
	err := r.db.Table("users").Where("id = ?", userID).Pluck("role_id", &roleID).Error
	if err != nil {
		return nil, err
	}

	// Get role code to check if user is admin
	err = r.db.Table("roles").Where("id = ?", roleID).Pluck("code", &roleCode).Error
	if err != nil {
		return nil, err
	}

	// Check if user is admin - admin has ALL permissions
	isAdmin := roleCode == "admin"

	// Create a map of permission IDs for quick lookup
	permissionMap := make(map[string]bool)
	
	if isAdmin {
		// Admin: Get ALL permissions and set them all to TRUE
		var allPermissions []permission.Permission
		if err := r.db.Find(&allPermissions).Error; err == nil {
			for _, p := range allPermissions {
				permissionMap[p.ID] = true
			}
		}
	} else {
		// Non-admin: Get permissions for the role
		permissions, err := r.GetByRoleID(roleID)
		if err != nil {
			return nil, err
		}
		for _, p := range permissions {
			permissionMap[p.ID] = true
		}
	}

	// Get all menus with hierarchy
	var menus []permission.Menu
	err = r.db.Where("parent_id IS NULL").Preload("Children").Order("\"order\" ASC").Find(&menus).Error
	if err != nil {
		return nil, err
	}

	// Build hierarchical response
	result := &permission.GetUserPermissionsResponse{
		Menus: make([]permission.MenuWithActionsResponse, 0),
	}

	for _, menu := range menus {
		menuResp := r.buildMenuWithActions(menu, permissionMap, isAdmin)
		result.Menus = append(result.Menus, *menuResp)
	}

	return result, nil
}

func (r *repository) buildMenuWithActions(menu permission.Menu, permissionMap map[string]bool, isAdmin bool) *permission.MenuWithActionsResponse {
	// Get permissions for this menu
	var menuPermissions []permission.Permission
	r.db.Where("menu_id = ?", menu.ID).Find(&menuPermissions)

	// Build actions
	actions := make([]permission.ActionResponse, 0)
	for _, p := range menuPermissions {
		// Admin always has access to all actions
		access := isAdmin || permissionMap[p.ID]
		actions = append(actions, permission.ActionResponse{
			ID:     p.ID,
			Code:   p.Code,
			Name:   p.Name,
			Access: access,
		})
	}

	// Build menu response
	menuResp := &permission.MenuWithActionsResponse{
		ID:       menu.ID,
		Name:     menu.Name,
		Icon:     menu.Icon,
		URL:      menu.URL,
		Actions:  actions,
		Children: make([]permission.MenuWithActionsResponse, 0),
	}

	// Recursively build children
	if len(menu.Children) > 0 {
		for _, child := range menu.Children {
			childResp := r.buildMenuWithActions(child, permissionMap, isAdmin)
			menuResp.Children = append(menuResp.Children, *childResp)
		}
	}

	return menuResp
}

// MenuRepository implementation
type menuRepository struct {
	db *gorm.DB
}

// NewMenuRepository creates a new menu repository
func NewMenuRepository(db *gorm.DB) interfaces.MenuRepository {
	return &menuRepository{db: db}
}

func (r *menuRepository) FindByID(id string) (*permission.Menu, error) {
	var m permission.Menu
	err := r.db.Preload("Parent").Preload("Children").Where("id = ?", id).First(&m).Error
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *menuRepository) FindByURL(url string) (*permission.Menu, error) {
	var m permission.Menu
	err := r.db.Preload("Parent").Preload("Children").Where("url = ?", url).First(&m).Error
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *menuRepository) List() ([]permission.Menu, error) {
	var menus []permission.Menu
	err := r.db.Preload("Parent").Preload("Children").Order("\"order\" ASC").Find(&menus).Error
	if err != nil {
		return nil, err
	}
	return menus, nil
}

func (r *menuRepository) GetRootMenus() ([]permission.Menu, error) {
	var menus []permission.Menu
	err := r.db.Where("parent_id IS NULL").Preload("Children").Order("\"order\" ASC").Find(&menus).Error
	if err != nil {
		return nil, err
	}
	return menus, nil
}

func (r *menuRepository) Create(m *permission.Menu) error {
	return r.db.Create(m).Error
}

func (r *menuRepository) Update(m *permission.Menu) error {
	return r.db.Save(m).Error
}

func (r *menuRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&permission.Menu{}).Error
}

