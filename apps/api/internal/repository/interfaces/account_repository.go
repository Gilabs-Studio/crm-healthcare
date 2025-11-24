package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
)

// AccountRepository defines the interface for account repository
type AccountRepository interface {
	// FindByID finds an account by ID
	FindByID(id string) (*account.Account, error)
	
	// List returns a list of accounts with pagination
	List(req *account.ListAccountsRequest) ([]account.Account, int64, error)
	
	// Create creates a new account
	Create(account *account.Account) error
	
	// Update updates an account
	Update(account *account.Account) error
	
	// Delete soft deletes an account
	Delete(id string) error
}

