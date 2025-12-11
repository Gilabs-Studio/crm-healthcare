package permission

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/permission"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrPermissionNotFound = errors.New("permission not found")
	ErrUserNotFound       = errors.New("user not found")
)

type Service struct {
	permissionRepo interfaces.PermissionRepository
	userRepo       interfaces.UserRepository
}

func NewService(permissionRepo interfaces.PermissionRepository, userRepo interfaces.UserRepository) *Service {
	return &Service{
		permissionRepo: permissionRepo,
		userRepo:       userRepo,
	}
}

// List returns a list of permissions
func (s *Service) List() ([]permission.PermissionResponse, error) {
	permissions, err := s.permissionRepo.List()
	if err != nil {
		return nil, err
	}

	responses := make([]permission.PermissionResponse, len(permissions))
	for i, p := range permissions {
		responses[i] = *p.ToPermissionResponse()
	}

	return responses, nil
}

// GetByID returns a permission by ID
func (s *Service) GetByID(id string) (*permission.PermissionResponse, error) {
	p, err := s.permissionRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, err
	}
	return p.ToPermissionResponse(), nil
}

// GetUserPermissions returns hierarchical menu structure with permissions for a user
func (s *Service) GetUserPermissions(userID string) (*permission.GetUserPermissionsResponse, error) {
	// Check if user exists
	_, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return s.permissionRepo.GetUserPermissions(userID)
}

// GetMobilePermissions returns mobile-specific permissions for a user
// Returns permissions for: dashboard, task, accounts, contacts, visit reports with CRUD actions
func (s *Service) GetMobilePermissions(userID string) (*permission.MobilePermissionsResponse, error) {
	// Check if user exists
	_, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return s.permissionRepo.GetMobilePermissions(userID)
}

