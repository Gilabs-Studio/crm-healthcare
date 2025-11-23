package role

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/role"
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
func (s *Service) List() ([]role.RoleResponse, error) {
	roles, err := s.roleRepo.List()
	if err != nil {
		return nil, err
	}

	responses := make([]role.RoleResponse, len(roles))
	for i, r := range roles {
		responses[i] = *r.ToRoleResponse()
	}

	return responses, nil
}

// GetByID returns a role by ID
func (s *Service) GetByID(id string) (*role.RoleResponse, error) {
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
func (s *Service) Create(req *role.CreateRoleRequest) (*role.RoleResponse, error) {
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

	// Create role
	r := &role.Role{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Status:      status,
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
func (s *Service) Update(id string, req *role.UpdateRoleRequest) (*role.RoleResponse, error) {
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

