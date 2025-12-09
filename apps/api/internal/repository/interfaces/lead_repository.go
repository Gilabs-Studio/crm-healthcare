package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/lead"
)

// LeadRepository defines the interface for lead repository
type LeadRepository interface {
	// FindByID finds a lead by ID
	FindByID(id string) (*lead.Lead, error)

	// List returns a list of leads with pagination
	List(req *lead.ListLeadsRequest) ([]lead.Lead, int64, error)

	// Create creates a new lead
	Create(lead *lead.Lead) error

	// Update updates a lead
	Update(lead *lead.Lead) error

	// Delete soft deletes a lead
	Delete(id string) error

	// GetAnalytics returns lead analytics
	GetAnalytics(req *lead.LeadAnalyticsRequest) (*lead.LeadAnalyticsResponse, error)
}

