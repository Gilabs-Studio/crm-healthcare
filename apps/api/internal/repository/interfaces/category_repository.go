package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/category"
)

// CategoryRepository defines the interface for category repository
type CategoryRepository interface {
	// FindByID finds a category by ID
	FindByID(id string) (*category.Category, error)

	// List returns a list of categories with pagination and filters
	List(req *category.ListCategoriesRequest) ([]category.Category, int64, error)

	// Create creates a new category
	Create(category *category.Category) error

	// Update updates a category
	Update(category *category.Category) error

	// Delete soft deletes a category
	Delete(id string) error
}

