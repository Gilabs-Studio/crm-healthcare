package role

import (
	"errors"

	roledomain "github.com/gilabs/crm-healthcare/api/internal/domain/role"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrRoleNotFound      = errors.New("role not found")
	ErrRoleAlreadyExists = errors.New("role already exists")
)

type Service struct {
	roleRepo interfaces.RoleRepository
}

func NewService(roleRepo interfaces.RoleRepository) *Service {
	return &Service{
		roleRepo: roleRepo,
	}
}

// List returns a list of roles
func (s *Service) List() ([]roledomain.RoleResponse, error) {
	roles, err := s.roleRepo.List()
	if err != nil {
		return nil, err
	}

	responses := make([]roledomain.RoleResponse, len(roles))
	for i, r := range roles {
		responses[i] = *r.ToRoleResponse()
	}

	return responses, nil
}

// GetByID returns a role by ID
func (s *Service) GetByID(id string) (*roledomain.RoleResponse, error) {
	r, err := s.roleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}
	return r.ToRoleResponse(), nil
}

// Create creates a new role
func (s *Service) Create(req *roledomain.CreateRoleRequest) (*roledomain.RoleResponse, error) {
	// Check if code already exists
	_, err := s.roleRepo.FindByCode(req.Code)
	if err == nil {
		return nil, ErrRoleAlreadyExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Set default status
	status := req.Status
	if status == "" {
		status = "active"
	}

	// Set default mobile_access
	mobileAccess := false
	if req.MobileAccess != nil {
		mobileAccess = *req.MobileAccess
	}

	// Create role
	r := &roledomain.Role{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Status:      status,
		MobileAccess: mobileAccess,
	}

	if err := s.roleRepo.Create(r); err != nil {
		return nil, err
	}

	// Reload with permissions
	createdRole, err := s.roleRepo.FindByID(r.ID)
	if err != nil {
		return nil, err
	}

	return createdRole.ToRoleResponse(), nil
}

// Update updates a role
func (s *Service) Update(id string, req *roledomain.UpdateRoleRequest) (*roledomain.RoleResponse, error) {
	// Find role
	r, err := s.roleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}

	// Update fields
	if req.Name != "" {
		r.Name = req.Name
	}

	if req.Code != "" {
		// Check if code already exists (excluding current role)
		existingRole, err := s.roleRepo.FindByCode(req.Code)
		if err == nil && existingRole.ID != id {
			return nil, ErrRoleAlreadyExists
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		r.Code = req.Code
	}

	if req.Description != "" {
		r.Description = req.Description
	}

	if req.Status != "" {
		r.Status = req.Status
	}

	if req.MobileAccess != nil {
		r.MobileAccess = *req.MobileAccess
	}

	if err := s.roleRepo.Update(r); err != nil {
		return nil, err
	}

	// Reload with permissions
	updatedRole, err := s.roleRepo.FindByID(r.ID)
	if err != nil {
		return nil, err
	}

	return updatedRole.ToRoleResponse(), nil
}

// Delete deletes a role
func (s *Service) Delete(id string) error {
	// Check if role exists
	_, err := s.roleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrRoleNotFound
		}
		return err
	}

	return s.roleRepo.Delete(id)
}

// AssignPermissions assigns permissions to a role
func (s *Service) AssignPermissions(roleID string, permissionIDs []string) error {
	// Check if role exists
	_, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrRoleNotFound
		}
		return err
	}

	return s.roleRepo.AssignPermissions(roleID, permissionIDs)
}

// GetMobilePermissions returns mobile permissions for a role
func (s *Service) GetMobilePermissions(roleID string) (*roledomain.GetMobilePermissionsResponse, error) {
	// Check if role exists
	r, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, err
	}

	return s.roleRepo.GetMobilePermissions(roleID, r)
}

// UpdateMobilePermissions updates mobile permissions for a role
func (s *Service) UpdateMobilePermissions(roleID string, req *roledomain.UpdateMobilePermissionsRequest) error {
	// Check if role exists
	_, err := s.roleRepo.FindByID(roleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrRoleNotFound
		}
		return err
	}

	return s.roleRepo.UpdateMobilePermissions(roleID, req)
}

