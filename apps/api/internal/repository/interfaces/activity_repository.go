package interfaces

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
)

// ActivityRepository defines the interface for activity repository
type ActivityRepository interface {
	// FindByID finds an activity by ID
	FindByID(id string) (*activity.Activity, error)
	
	// List returns a list of activities with pagination
	List(req *activity.ListActivitiesRequest) ([]activity.Activity, int64, error)
	
	// Create creates a new activity
	Create(a *activity.Activity) error
	
	// Update updates an activity
	Update(a *activity.Activity) error
	
	// Delete soft deletes an activity
	Delete(id string) error
	
	// GetTimeline returns activity timeline for account/contact/user
	GetTimeline(req *activity.ActivityTimelineRequest) ([]activity.Activity, error)
	
	// FindByAccountID finds activities by account ID
	FindByAccountID(accountID string) ([]activity.Activity, error)
}

