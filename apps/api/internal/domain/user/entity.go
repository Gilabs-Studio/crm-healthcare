package user

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a user entity (extends auth.User concept)
// Note: We'll use the same users table as auth, but add role/permission relationships
type User struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email       string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password    string    `gorm:"type:varchar(255);not null" json:"-"` // Hidden from JSON
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Role        string    `gorm:"type:varchar(50);not null;default:'user'" json:"role"`
	Status      string    `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	UserRoles    []UserRole    `gorm:"foreignKey:UserID" json:"user_roles,omitempty"`
	Permissions  []Permission  `gorm:"many2many:user_permissions;" json:"permissions,omitempty"`
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to generate UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

// Role represents a role entity
type Role struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Status      string    `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	RolePermissions []RolePermission `gorm:"foreignKey:RoleID" json:"role_permissions,omitempty"`
	Users           []User           `gorm:"many2many:user_roles;" json:"users,omitempty"`
}

// TableName specifies the table name for Role
func (Role) TableName() string {
	return "roles"
}

// BeforeCreate hook to generate UUID
func (r *Role) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

// Permission represents a permission entity
type Permission struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
	Code        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"code"` // e.g., "users:read", "users:write"
	Description string    `gorm:"type:text" json:"description"`
	Resource    string    `gorm:"type:varchar(100);not null" json:"resource"` // e.g., "users", "patients"
	Action      string    `gorm:"type:varchar(50);not null" json:"action"`    // e.g., "read", "write", "delete"
	Status      string    `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	RolePermissions []RolePermission `gorm:"foreignKey:PermissionID" json:"role_permissions,omitempty"`
	Users           []User           `gorm:"many2many:user_permissions;" json:"users,omitempty"`
}

// TableName specifies the table name for Permission
func (Permission) TableName() string {
	return "permissions"
}

// BeforeCreate hook to generate UUID
func (p *Permission) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// UserRole represents the many-to-many relationship between User and Role
type UserRole struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    string    `gorm:"type:uuid;not null;index" json:"user_id"`
	RoleID    string    `gorm:"type:uuid;not null;index" json:"role_id"`
	CreatedAt time.Time `json:"created_at"`
	
	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Role Role `gorm:"foreignKey:RoleID" json:"role,omitempty"`
}

// TableName specifies the table name for UserRole
func (UserRole) TableName() string {
	return "user_roles"
}

// RolePermission represents the many-to-many relationship between Role and Permission
type RolePermission struct {
	ID           string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RoleID       string    `gorm:"type:uuid;not null;index" json:"role_id"`
	PermissionID string    `gorm:"type:uuid;not null;index" json:"permission_id"`
	CreatedAt    time.Time `json:"created_at"`
	
	// Relationships
	Role       Role       `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Permission Permission `gorm:"foreignKey:PermissionID" json:"permission,omitempty"`
}

// TableName specifies the table name for RolePermission
func (RolePermission) TableName() string {
	return "role_permissions"
}

// DTOs (Data Transfer Objects)

// UserResponse represents user response DTO (without sensitive data)
type UserResponse struct {
	ID          string           `json:"id"`
	Email       string           `json:"email"`
	Name        string           `json:"name"`
	Role        string           `json:"role"`
	Status      string           `json:"status"`
	Roles       []RoleResponse   `json:"roles,omitempty"`
	Permissions []PermissionResponse `json:"permissions,omitempty"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

// ToUserResponse converts User to UserResponse
func (u *User) ToUserResponse() *UserResponse {
	roles := make([]RoleResponse, len(u.UserRoles))
	for i, ur := range u.UserRoles {
		roles[i] = RoleResponse{
			ID:          ur.Role.ID,
			Name:        ur.Role.Name,
			Description: ur.Role.Description,
		}
	}
	
	permissions := make([]PermissionResponse, len(u.Permissions))
	for i, p := range u.Permissions {
		permissions[i] = PermissionResponse{
			ID:          p.ID,
			Name:        p.Name,
			Code:        p.Code,
			Description: p.Description,
			Resource:    p.Resource,
			Action:      p.Action,
		}
	}
	
	return &UserResponse{
		ID:          u.ID,
		Email:       u.Email,
		Name:        u.Name,
		Role:        u.Role,
		Status:      u.Status,
		Roles:       roles,
		Permissions: permissions,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}
}

// RoleResponse represents role response DTO
type RoleResponse struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Status      string   `json:"status"`
	Permissions []PermissionResponse `json:"permissions,omitempty"`
}

// PermissionResponse represents permission response DTO
type PermissionResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Resource    string `json:"resource"`
	Action      string `json:"action"`
	Status      string `json:"status"`
}

// Request DTOs

// CreateUserRequest represents create user request
type CreateUserRequest struct {
	Email       string   `json:"email" binding:"required,email"`
	Password    string   `json:"password" binding:"required,min=6"`
	Name        string   `json:"name" binding:"required,min=2"`
	Role        string   `json:"role" binding:"required"`
	Status      string   `json:"status" binding:"omitempty,oneof=active inactive"`
	RoleIDs     []string `json:"role_ids,omitempty"`
	PermissionIDs []string `json:"permission_ids,omitempty"`
}

// UpdateUserRequest represents update user request
type UpdateUserRequest struct {
	Email       *string  `json:"email,omitempty" binding:"omitempty,email"`
	Name        *string  `json:"name,omitempty" binding:"omitempty,min=2"`
	Role        *string  `json:"role,omitempty"`
	Status      *string  `json:"status,omitempty" binding:"omitempty,oneof=active inactive"`
	Password    *string  `json:"password,omitempty" binding:"omitempty,min=6"`
}

// UpdateUserPermissionsRequest represents update user permissions request
type UpdateUserPermissionsRequest struct {
	RoleIDs       []string `json:"role_ids,omitempty"`
	PermissionIDs []string `json:"permission_ids,omitempty"`
}

// ListUsersRequest represents list users query parameters
type ListUsersRequest struct {
	Page     int    `form:"page" binding:"omitempty,min=1"`
	PerPage  int    `form:"per_page" binding:"omitempty,min=1,max=100"`
	Search   string `form:"search" binding:"omitempty"`
	Role     string `form:"role" binding:"omitempty"`
	Status   string `form:"status" binding:"omitempty,oneof=active inactive"`
	SortBy   string `form:"sort_by" binding:"omitempty"`
	SortOrder string `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}

// ListUsersResponse represents list users response
type ListUsersResponse struct {
	Users []UserResponse `json:"users"`
	Total int           `json:"total"`
}

