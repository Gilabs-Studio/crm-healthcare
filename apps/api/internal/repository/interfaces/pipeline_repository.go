package interfaces

import (
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
)

// PipelineRepository defines the interface for pipeline repository
type PipelineRepository interface {
	// FindStageByID finds a pipeline stage by ID
	FindStageByID(id string) (*pipeline.PipelineStage, error)
	
	// FindStageByCode finds a pipeline stage by code
	FindStageByCode(code string) (*pipeline.PipelineStage, error)
	
	// ListStages returns a list of pipeline stages
	ListStages(req *pipeline.ListPipelineStagesRequest) ([]pipeline.PipelineStage, error)
	
	// CreateStage creates a new pipeline stage
	CreateStage(stage *pipeline.PipelineStage) error
	
	// UpdateStage updates a pipeline stage
	UpdateStage(stage *pipeline.PipelineStage) error
	
	// DeleteStage soft deletes a pipeline stage
	DeleteStage(id string) error
}

// DealRepository defines the interface for deal repository
type DealRepository interface {
	// FindByID finds a deal by ID
	FindByID(id string) (*pipeline.Deal, error)
	
	// List returns a list of deals with pagination
	List(req *pipeline.ListDealsRequest) ([]pipeline.Deal, int64, error)
	
	// Create creates a new deal
	Create(deal *pipeline.Deal) error
	
	// Update updates a deal
	Update(deal *pipeline.Deal) error
	
	// Delete soft deletes a deal
	Delete(id string) error
	
	// GetSummary returns pipeline summary statistics
	GetSummary() (*pipeline.PipelineSummaryResponse, error)
	
	// GetForecast returns forecast data
	GetForecast(periodType string, start, end time.Time) (*pipeline.ForecastResponse, error)
}

