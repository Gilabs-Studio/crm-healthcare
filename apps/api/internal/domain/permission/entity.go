package permission

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Permission represents a permission entity
type Permission struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Code        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"code"`
	MenuID      *string   `gorm:"type:uuid;index" json:"menu_id,omitempty"`
	Menu        *Menu     `gorm:"foreignKey:MenuID" json:"menu,omitempty"`
	Action      string    `gorm:"type:varchar(50);not null" json:"action"` // VIEW, CREATE, EDIT, DELETE, etc.
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
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

// PermissionResponse represents permission response DTO
type PermissionResponse struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Code        string         `json:"code"`
	MenuID      *string        `json:"menu_id,omitempty"`
	Menu        *MenuResponse  `json:"menu,omitempty"`
	Action      string         `json:"action"`
	Description string         `json:"description"`
	Access      bool           `json:"access"` // For role-based permission check
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

// ToPermissionResponse converts Permission to PermissionResponse
func (p *Permission) ToPermissionResponse() *PermissionResponse {
	resp := &PermissionResponse{
		ID:          p.ID,
		Name:        p.Name,
		Code:        p.Code,
		MenuID:      p.MenuID,
		Action:      p.Action,
		Description: p.Description,
		Access:      false, // Default, will be set based on role
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
	if p.Menu != nil {
		resp.Menu = p.Menu.ToMenuResponse()
	}
	return resp
}

// Menu represents a menu entity (hierarchical structure)
type Menu struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Icon        string    `gorm:"type:varchar(100)" json:"icon"`
	URL         string    `gorm:"type:varchar(255);not null" json:"url"`
	ParentID    *string   `gorm:"type:uuid;index" json:"parent_id,omitempty"`
	Parent      *Menu     `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children    []Menu    `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Order       int       `gorm:"type:integer;default:0" json:"order"`
	Status      string    `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Menu
func (Menu) TableName() string {
	return "menus"
}

// BeforeCreate hook to generate UUID
func (m *Menu) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return nil
}

// MenuResponse represents menu response DTO (with nested structure)
type MenuResponse struct {
	ID        string          `json:"id"`
	Name      string          `json:"name"`
	Icon      string          `json:"icon"`
	URL       string          `json:"url"`
	ParentID  *string         `json:"parent_id,omitempty"`
	Children  []MenuResponse  `json:"children,omitempty"`
	Actions   []ActionResponse `json:"actions,omitempty"`
	Order     int             `json:"order"`
	Status    string          `json:"status"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// ActionResponse represents action response DTO
type ActionResponse struct {
	ID          string `json:"id"`
	Code        string `json:"code"`
	Name        string `json:"name"`
	Access      bool   `json:"access"`
}

// ToMenuResponse converts Menu to MenuResponse (recursive for children)
func (m *Menu) ToMenuResponse() *MenuResponse {
	resp := &MenuResponse{
		ID:        m.ID,
		Name:      m.Name,
		Icon:      m.Icon,
		URL:       m.URL,
		ParentID:  m.ParentID,
		Order:     m.Order,
		Status:    m.Status,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
	if len(m.Children) > 0 {
		resp.Children = make([]MenuResponse, len(m.Children))
		for i, child := range m.Children {
			resp.Children[i] = *child.ToMenuResponse()
		}
	}
	return resp
}

// GetUserPermissionsResponse represents user permissions response (hierarchical menu structure)
type GetUserPermissionsResponse struct {
	Menus []MenuWithActionsResponse `json:"menus"`
}

// MenuWithActionsResponse represents menu with actions response
type MenuWithActionsResponse struct {
	ID        string                  `json:"id"`
	Name      string                  `json:"name"`
	Icon      string                  `json:"icon"`
	URL       string                  `json:"url"`
	Children  []MenuWithActionsResponse `json:"children,omitempty"`
	Actions   []ActionResponse        `json:"actions,omitempty"`
}

// MobilePermissionsResponse represents mobile permissions response
type MobilePermissionsResponse struct {
	Menus []MobileMenuPermission `json:"menus"`
}

// MobileMenuPermission represents a mobile menu with CRUD permissions
type MobileMenuPermission struct {
	Menu    string   `json:"menu"`    // dashboard, task, accounts, contacts, visit_reports
	Actions []string `json:"actions"` // VIEW, CREATE, EDIT, DELETE
}

