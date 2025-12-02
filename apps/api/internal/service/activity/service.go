package activity

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

var (
	ErrActivityNotFound = errors.New("activity not found")
)

type Service struct {
	activityRepo     interfaces.ActivityRepository
	activityTypeRepo interfaces.ActivityTypeRepository
	accountRepo      interfaces.AccountRepository
	contactRepo      interfaces.ContactRepository
	userRepo         interfaces.UserRepository
}

func NewService(activityRepo interfaces.ActivityRepository, activityTypeRepo interfaces.ActivityTypeRepository, accountRepo interfaces.AccountRepository, contactRepo interfaces.ContactRepository, userRepo interfaces.UserRepository) *Service {
	return &Service{
		activityRepo:     activityRepo,
		activityTypeRepo: activityTypeRepo,
		accountRepo:      accountRepo,
		contactRepo:      contactRepo,
		userRepo:         userRepo,
	}
}

// PaginationResult represents pagination information
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}

// List returns a list of activities with pagination
func (s *Service) List(req *activity.ListActivitiesRequest) ([]activity.ActivityResponse, *PaginationResult, error) {
	activities, total, err := s.activityRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]activity.ActivityResponse, len(activities))
	for i, a := range activities {
		response := *a.ToActivityResponse()
		// Parse metadata JSON
		if a.Metadata != nil {
			var metadata interface{}
			if err := json.Unmarshal(a.Metadata, &metadata); err == nil {
				response.Metadata = metadata
			}
		}
		// Load Account
		if a.AccountID != nil && *a.AccountID != "" {
			if account, err := s.accountRepo.FindByID(*a.AccountID); err == nil {
				response.Account = map[string]interface{}{
					"id":   account.ID,
					"name": account.Name,
				}
			}
		}
		// Load Contact
		if a.ContactID != nil && *a.ContactID != "" {
			if contact, err := s.contactRepo.FindByID(*a.ContactID); err == nil {
				response.Contact = map[string]interface{}{
					"id":   contact.ID,
					"name": contact.Name,
				}
			}
		}
		// Load User
		if user, err := s.userRepo.FindByID(a.UserID); err == nil {
			response.User = map[string]interface{}{
				"id":   user.ID,
				"name": user.Name,
			}
		}
		// Load ActivityType
		if a.ActivityTypeID != nil && *a.ActivityTypeID != "" {
			if activityType, err := s.activityTypeRepo.FindByID(*a.ActivityTypeID); err == nil {
				response.ActivityType = activityType.ToActivityTypeResponse()
			}
		}
		responses[i] = response
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	perPage := req.PerPage
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	pagination := &PaginationResult{
		Page:       page,
		PerPage:    perPage,
		Total:      int(total),
		TotalPages: int((total + int64(perPage) - 1) / int64(perPage)),
	}

	return responses, pagination, nil
}

// GetByID returns an activity by ID
func (s *Service) GetByID(id string) (*activity.ActivityResponse, error) {
	a, err := s.activityRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrActivityNotFound
		}
		return nil, err
	}

	response := *a.ToActivityResponse()
	// Parse metadata JSON
	if a.Metadata != nil {
		var metadata interface{}
		if err := json.Unmarshal(a.Metadata, &metadata); err == nil {
			response.Metadata = metadata
		}
	}
	// Load ActivityType
	if a.ActivityTypeID != nil && *a.ActivityTypeID != "" {
		if activityType, err := s.activityTypeRepo.FindByID(*a.ActivityTypeID); err == nil {
			response.ActivityType = activityType.ToActivityTypeResponse()
		}
	}

	return &response, nil
}

// Create creates a new activity
func (s *Service) Create(req *activity.CreateActivityRequest) (*activity.ActivityResponse, error) {
	// Validate UserID
	if req.UserID == "" {
		return nil, errors.New("user_id is required")
	}

	// Validate that either activity_type_id or type is provided
	if (req.ActivityTypeID == nil || *req.ActivityTypeID == "") && req.Type == "" {
		return nil, errors.New("either activity_type_id or type is required")
	}

	// Parse timestamp
	timestamp, err := time.Parse(time.RFC3339, req.Timestamp)
	if err != nil {
		// Try alternative format
		timestamp, err = time.Parse("2006-01-02T15:04:05Z07:00", req.Timestamp)
		if err != nil {
			return nil, errors.New("invalid timestamp format")
		}
	}

	// Marshal metadata to JSON
	var metadataJSON datatypes.JSON
	if req.Metadata != nil {
		metadataBytes, err := json.Marshal(req.Metadata)
		if err != nil {
			return nil, err
		}
		metadataJSON = metadataBytes
	}

	// Determine type: use ActivityTypeID if provided, otherwise use Type
	var activityType string
	if req.ActivityTypeID != nil && *req.ActivityTypeID != "" {
		// Load ActivityType to get the code/type
		activityTypeEntity, err := s.activityTypeRepo.FindByID(*req.ActivityTypeID)
		if err == nil && activityTypeEntity != nil {
			activityType = activityTypeEntity.Code
		} else {
			// Fallback to provided Type if ActivityType not found
			activityType = req.Type
		}
	} else {
		// Use provided Type (backward compatibility)
		activityType = req.Type
	}

	a := &activity.Activity{
		Type:          activityType,
		ActivityTypeID: req.ActivityTypeID,
		AccountID:     req.AccountID,
		ContactID:     req.ContactID,
		UserID:        req.UserID,
		Description:   req.Description,
		Timestamp:     timestamp,
		Metadata:      metadataJSON,
	}

	if err := s.activityRepo.Create(a); err != nil {
		return nil, err
	}

	// Reload
	createdActivity, err := s.activityRepo.FindByID(a.ID)
	if err != nil {
		return nil, err
	}

	response := *createdActivity.ToActivityResponse()
	if createdActivity.Metadata != nil {
		var metadata interface{}
		if err := json.Unmarshal(createdActivity.Metadata, &metadata); err == nil {
			response.Metadata = metadata
		}
	}

	return &response, nil
}

// GetTimeline returns activity timeline
func (s *Service) GetTimeline(req *activity.ActivityTimelineRequest) ([]activity.ActivityResponse, error) {
	activities, err := s.activityRepo.GetTimeline(req)
	if err != nil {
		return nil, err
	}

	responses := make([]activity.ActivityResponse, len(activities))
	for i, a := range activities {
		response := *a.ToActivityResponse()
		// Parse metadata JSON
		if a.Metadata != nil {
			var metadata interface{}
			if err := json.Unmarshal(a.Metadata, &metadata); err == nil {
				response.Metadata = metadata
			}
		}
		// Load Account
		if a.AccountID != nil && *a.AccountID != "" {
			if account, err := s.accountRepo.FindByID(*a.AccountID); err == nil {
				response.Account = map[string]interface{}{
					"id":   account.ID,
					"name": account.Name,
				}
			}
		}
		// Load Contact
		if a.ContactID != nil && *a.ContactID != "" {
			if contact, err := s.contactRepo.FindByID(*a.ContactID); err == nil {
				response.Contact = map[string]interface{}{
					"id":   contact.ID,
					"name": contact.Name,
				}
			}
		}
		// Load User
		if user, err := s.userRepo.FindByID(a.UserID); err == nil {
			response.User = map[string]interface{}{
				"id":   user.ID,
				"name": user.Name,
			}
		}
		// Load ActivityType
		if a.ActivityTypeID != nil && *a.ActivityTypeID != "" {
			if activityType, err := s.activityTypeRepo.FindByID(*a.ActivityTypeID); err == nil {
				response.ActivityType = activityType.ToActivityTypeResponse()
			}
		}
		responses[i] = response
	}

	return responses, nil
}

