package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/auth"
)

// AuthRepository defines the interface for auth repository
type AuthRepository interface {
	// FindByEmail finds a user by email
	FindByEmail(email string) (*auth.User, error)
	
	// FindByID finds a user by ID
	FindByID(id string) (*auth.User, error)
	
	// Create creates a new user
	Create(user *auth.User) error
	
	// Update updates a user
	Update(user *auth.User) error
}

