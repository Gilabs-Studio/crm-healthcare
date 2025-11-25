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
	activityRepo interfaces.ActivityRepository
}

func NewService(activityRepo interfaces.ActivityRepository) *Service {
	return &Service{
		activityRepo: activityRepo,
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

	return &response, nil
}

// Create creates a new activity
func (s *Service) Create(req *activity.CreateActivityRequest) (*activity.ActivityResponse, error) {
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

	a := &activity.Activity{
		Type:        req.Type,
		AccountID:   req.AccountID,
		ContactID:   req.ContactID,
		UserID:      req.UserID,
		Description: req.Description,
		Timestamp:   timestamp,
		Metadata:    metadataJSON,
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
		responses[i] = response
	}

	return responses, nil
}

