package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
)

// UserRepository defines the interface for user repository
type UserRepository interface {
	// FindByID finds a user by ID with relationships
	FindByID(id string) (*user.User, error)
	
	// FindByEmail finds a user by email
	FindByEmail(email string) (*user.User, error)
	
	// List returns a list of users with pagination and filters
	List(req *user.ListUsersRequest) ([]user.User, int64, error)
	
	// Create creates a new user
	Create(user *user.User) error
	
	// Update updates a user
	Update(user *user.User) error
	
	// Delete soft deletes a user
	Delete(id string) error
	
	// AssignRoles assigns roles to a user
	AssignRoles(userID string, roleIDs []string) error
	
	// RemoveRoles removes roles from a user
	RemoveRoles(userID string, roleIDs []string) error
	
	// AssignPermissions assigns permissions to a user
	AssignPermissions(userID string, permissionIDs []string) error
	
	// RemovePermissions removes permissions from a user
	RemovePermissions(userID string, permissionIDs []string) error
	
	// GetUserPermissions gets all permissions for a user (from roles + direct)
	GetUserPermissions(userID string) ([]user.Permission, error)
	
	// RoleRepository methods
	FindRoleByID(id string) (*user.Role, error)
	FindRoleByName(name string) (*user.Role, error)
	ListRoles() ([]user.Role, error)
	CreateRole(role *user.Role) error
	UpdateRole(role *user.Role) error
	
	// PermissionRepository methods
	FindPermissionByID(id string) (*user.Permission, error)
	FindPermissionByCode(code string) (*user.Permission, error)
	ListPermissions() ([]user.Permission, error)
	CreatePermission(permission *user.Permission) error
	UpdatePermission(permission *user.Permission) error
}

