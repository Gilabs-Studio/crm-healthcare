package user

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrInvalidPassword   = errors.New("invalid password")
	ErrRoleNotFound      = errors.New("role not found")
	ErrPermissionNotFound = errors.New("permission not found")
)

type Service struct {
	repo interfaces.UserRepository
}

func NewService(repo interfaces.UserRepository) *Service {
	return &Service{
		repo: repo,
	}
}

// List returns a list of users with pagination
func (s *Service) List(req *user.ListUsersRequest) (*user.ListUsersResponse, error) {
	users, total, err := s.repo.List(req)
	if err != nil {
		return nil, err
	}

	userResponses := make([]user.UserResponse, len(users))
	for i, u := range users {
		userResponses[i] = *u.ToUserResponse()
	}

	return &user.ListUsersResponse{
		Users: userResponses,
		Total: int(total),
	}, nil
}

// GetByID returns a user by ID
func (s *Service) GetByID(id string) (*user.UserResponse, error) {
	u, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return u.ToUserResponse(), nil
}

// Create creates a new user
func (s *Service) Create(req *user.CreateUserRequest) (*user.UserResponse, error) {
	// Check if user already exists
	existingUser, _ := s.repo.FindByEmail(req.Email)
	if existingUser != nil {
		return nil, ErrUserAlreadyExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Set default status
	status := req.Status
	if status == "" {
		status = "active"
	}

	// Create user
	u := &user.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
		Role:     req.Role,
		Status:   status,
	}

	if err := s.repo.Create(u); err != nil {
		return nil, err
	}

	// Assign roles if provided
	if len(req.RoleIDs) > 0 {
		if err := s.repo.AssignRoles(u.ID, req.RoleIDs); err != nil {
			return nil, err
		}
	}

	// Assign permissions if provided
	if len(req.PermissionIDs) > 0 {
		if err := s.repo.AssignPermissions(u.ID, req.PermissionIDs); err != nil {
			return nil, err
		}
	}

	// Reload user with relationships
	createdUser, err := s.repo.FindByID(u.ID)
	if err != nil {
		return nil, err
	}

	return createdUser.ToUserResponse(), nil
}

// Update updates a user
func (s *Service) Update(id string, req *user.UpdateUserRequest) (*user.UserResponse, error) {
	u, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	// Update fields if provided
	if req.Email != nil {
		// Check if email is already taken by another user
		existingUser, _ := s.repo.FindByEmail(*req.Email)
		if existingUser != nil && existingUser.ID != id {
			return nil, ErrUserAlreadyExists
		}
		u.Email = *req.Email
	}

	if req.Name != nil {
		u.Name = *req.Name
	}

	if req.Role != nil {
		u.Role = *req.Role
	}

	if req.Status != nil {
		u.Status = *req.Status
	}

	if req.Password != nil {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		u.Password = string(hashedPassword)
	}

	if err := s.repo.Update(u); err != nil {
		return nil, err
	}

	// Reload user with relationships
	updatedUser, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	return updatedUser.ToUserResponse(), nil
}

// Delete soft deletes a user
func (s *Service) Delete(id string) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		}
		return err
	}

	return s.repo.Delete(id)
}

// UpdatePermissions updates user roles and permissions
func (s *Service) UpdatePermissions(id string, req *user.UpdateUserPermissionsRequest) (*user.UserResponse, error) {
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	// Update roles if provided
	if req.RoleIDs != nil {
		if err := s.repo.AssignRoles(id, req.RoleIDs); err != nil {
			return nil, err
		}
	}

	// Update permissions if provided
	if req.PermissionIDs != nil {
		if err := s.repo.AssignPermissions(id, req.PermissionIDs); err != nil {
			return nil, err
		}
	}

	// Reload user with relationships
	updatedUser, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	return updatedUser.ToUserResponse(), nil
}

// ListRoles returns all roles
func (s *Service) ListRoles() ([]user.RoleResponse, error) {
	roles, err := s.repo.ListRoles()
	if err != nil {
		return nil, err
	}

	roleResponses := make([]user.RoleResponse, len(roles))
	for i, r := range roles {
		roleResponses[i] = user.RoleResponse{
			ID:          r.ID,
			Name:        r.Name,
			Description: r.Description,
			Status:      r.Status,
		}
	}

	return roleResponses, nil
}

// ListPermissions returns all permissions
func (s *Service) ListPermissions() ([]user.PermissionResponse, error) {
	permissions, err := s.repo.ListPermissions()
	if err != nil {
		return nil, err
	}

	permissionResponses := make([]user.PermissionResponse, len(permissions))
	for i, p := range permissions {
		permissionResponses[i] = user.PermissionResponse{
			ID:          p.ID,
			Name:        p.Name,
			Code:        p.Code,
			Description: p.Description,
			Resource:    p.Resource,
			Action:      p.Action,
			Status:      p.Status,
		}
	}

	return permissionResponses, nil
}

