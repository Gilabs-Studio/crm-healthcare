package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/diagnosis"
)

// DiagnosisRepository defines the interface for diagnosis repository
type DiagnosisRepository interface {
	// FindByID finds a diagnosis by ID
	FindByID(id string) (*diagnosis.Diagnosis, error)

	// FindByCode finds a diagnosis by code
	FindByCode(code string) (*diagnosis.Diagnosis, error)

	// List returns a list of diagnoses with pagination
	List(req *diagnosis.ListDiagnosesRequest) ([]diagnosis.Diagnosis, int64, error)

	// Search returns a list of diagnoses matching the search query
	Search(req *diagnosis.SearchDiagnosesRequest) ([]diagnosis.Diagnosis, error)

	// Create creates a new diagnosis
	Create(d *diagnosis.Diagnosis) error

	// Update updates a diagnosis
	Update(d *diagnosis.Diagnosis) error

	// Delete soft deletes a diagnosis
	Delete(id string) error
}

