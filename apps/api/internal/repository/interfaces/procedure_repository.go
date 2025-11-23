package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/procedure"
)

// ProcedureRepository defines the interface for procedure repository
type ProcedureRepository interface {
	// FindByID finds a procedure by ID
	FindByID(id string) (*procedure.Procedure, error)

	// FindByCode finds a procedure by code
	FindByCode(code string) (*procedure.Procedure, error)

	// List returns a list of procedures with pagination
	List(req *procedure.ListProceduresRequest) ([]procedure.Procedure, int64, error)

	// Search returns a list of procedures matching the search query
	Search(req *procedure.SearchProceduresRequest) ([]procedure.Procedure, error)

	// Create creates a new procedure
	Create(p *procedure.Procedure) error

	// Update updates a procedure
	Update(p *procedure.Procedure) error

	// Delete soft deletes a procedure
	Delete(id string) error
}

